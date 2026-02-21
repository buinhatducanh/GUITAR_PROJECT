import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { deleteCloudinaryImages, collectImageUrls } from '../shared/utils/cloudinary-cleanup.js';

const router = Router();

/** GET /api/products — list with pagination, filters, search */
router.get('/', async (req, res) => {
    try {
        const {
            page = '1',
            limit = '20',
            category,
            search,
            sort = 'createdAt',
            order = 'desc',
            featured,
            minPrice,
            maxPrice,
        } = req.query as Record<string, string>;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = { isActive: true };

        if (category) {
            // Support parent category → include children
            const cat = await prisma.category.findUnique({
                where: { slug: category },
                include: { children: true },
            });
            if (cat) {
                const categoryIds = [cat.id, ...cat.children.map(c => c.id)];
                where.categoryId = { in: categoryIds };
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseInt(minPrice);
            if (maxPrice) where.price.lte = parseInt(maxPrice);
        }

        // Build orderBy
        const validSorts = ['price', 'name', 'createdAt', 'rating', 'discount'];
        const sortField = validSorts.includes(sort) ? sort : 'createdAt';
        const sortOrder = order === 'asc' ? 'asc' : 'desc';

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    _count: { select: { reviews: true } },
                },
                orderBy: { [sortField]: sortOrder },
                skip,
                take: limitNum,
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/products/:slug — single product with reviews */
router.get('/:slug', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                reviews: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!product) {
            res.status(404).json({ error: 'Sản phẩm không tồn tại' });
            return;
        }

        res.json(product);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/products — create (admin only) */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { name, price, oldPrice, discount, image, images, categoryId, description, specs, stock, isFeatured } = req.body;

        // Auto-generate slug
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Ensure unique slug
        let finalSlug = slug;
        let counter = 1;
        while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${counter++}`;
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                price,
                oldPrice,
                discount,
                image: image || '',
                images: images || [],
                categoryId,
                description,
                specs: specs || [],
                stock: stock || 0,
                isFeatured: isFeatured || false,
            },
            include: { category: { select: { id: true, name: true, slug: true } } },
        });

        res.status(201).json(product);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/products/:id — update (admin only) */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: req.body,
            include: { category: { select: { id: true, name: true, slug: true } } },
        });

        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/products/:id — delete (admin only) */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        // Fetch product to get image URLs before deleting
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            select: { image: true, images: true },
        });

        await prisma.product.delete({ where: { id: req.params.id } });

        // Clean up Cloudinary images (non-blocking)
        if (product) {
            const urls = collectImageUrls(product, ['image', 'images']);
            deleteCloudinaryImages(urls).catch(() => {});
        }

        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
