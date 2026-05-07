
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

        // CLEAN SEARCH
        const keyword = search?.trim();

        // Build where clause
        const where: any = { isActive: true };

        if (category) {
            const cat = await prisma.category.findUnique({
                where: { slug: category },
                include: { children: true },
            });

            if (cat) {
                const categoryIds = [cat.id, ...cat.children.map(c => c.id)];
                where.categoryId = { in: categoryIds };
            }
        }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
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

        // SAFE SORTING
        const validSorts = ['price', 'name', 'createdAt', 'rating', 'discount', 'stock'];
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

        // PAGINATION META
        const totalPages = Math.ceil(total / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage,
            },
            meta: {
                countInPage: products.length,
                isEmpty: products.length === 0,
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
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                    },
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
        const {
            name,
            price,
            oldPrice,
            discount,
            image,
            images,
            categoryId,
            description,
            specs,
            stock,
            isFeatured,
        } = req.body;

        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

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
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
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
        const {
            name,
            slug,
            price,
            oldPrice,
            discount,
            image,
            images,
            categoryId,
            brandId,
            description,
            specs,
            stock,
            isFeatured,
            isActive,
            lowStockAlert,
        } = req.body;

        const data: Record<string, any> = {};

        if (name !== undefined) data.name = name;
        if (slug !== undefined) data.slug = slug;
        if (price !== undefined) data.price = price;
        if (oldPrice !== undefined) data.oldPrice = oldPrice;
        if (discount !== undefined) data.discount = discount;
        if (image !== undefined) data.image = image;
        if (images !== undefined) data.images = images;
        if (categoryId !== undefined) data.categoryId = categoryId;
        if (brandId !== undefined) data.brandId = brandId;
        if (description !== undefined) data.description = description;
        if (specs !== undefined) data.specs = specs;
        if (stock !== undefined) data.stock = stock;
        if (isFeatured !== undefined) data.isFeatured = isFeatured;
        if (isActive !== undefined) data.isActive = isActive;
        if (lowStockAlert !== undefined) data.lowStockAlert = lowStockAlert;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data,
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
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
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            select: { image: true, images: true },
        });

        await prisma.product.delete({
            where: { id: req.params.id },
        });

        if (product) {
            const urls = collectImageUrls(product, ['image', 'images']);
            deleteCloudinaryImages(urls).catch(() => { });
        }

        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;