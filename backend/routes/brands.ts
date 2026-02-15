import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────

/** Get all brands */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { active } = req.query;

        const brands = await prisma.brand.findMany({
            where: active === 'true' ? { isActive: true } : undefined,
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        res.json({ brands });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch brands' });
    }
});

/** Get brand by slug */
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const brand = await prisma.brand.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!brand) {
            res.status(404).json({ error: 'Brand not found' });
            return;
        }

        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch brand' });
    }
});

/** Get products by brand */
router.get('/:id/products', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { limit = '20', offset = '0' } = req.query;

        const products = await prisma.product.findMany({
            where: { brandId: id, isActive: true },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.product.count({
            where: { brandId: id, isActive: true }
        });

        res.json({ products, total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ─── Admin Routes ─────────────────────────────────────────

/** Create brand (Admin only) */
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { name, slug, logo, description, website, hotline, order } = req.body;

        // Check if slug already exists
        const existing = await prisma.brand.findUnique({ where: { slug } });
        if (existing) {
            res.status(400).json({ error: 'Brand slug already exists' });
            return;
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logo,
                description,
                website,
                hotline,
                order: order || 0
            }
        });

        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create brand' });
    }
});

/** Update brand (Admin only) */
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, slug, logo, description, website, hotline, isActive, order } = req.body;

        // If changing slug, check if new slug exists
        if (slug) {
            const existing = await prisma.brand.findFirst({
                where: { slug, NOT: { id } }
            });
            if (existing) {
                res.status(400).json({ error: 'Brand slug already exists' });
                return;
            }
        }

        const brand = await prisma.brand.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(logo !== undefined && { logo }),
                ...(description !== undefined && { description }),
                ...(website !== undefined && { website }),
                ...(hotline !== undefined && { hotline }),
                ...(typeof isActive === 'boolean' && { isActive }),
                ...(order !== undefined && { order })
            }
        });

        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update brand' });
    }
});

/** Delete brand (Admin only) */
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if brand has products
        const productCount = await prisma.product.count({
            where: { brandId: id }
        });

        if (productCount > 0) {
            res.status(400).json({
                error: `Cannot delete brand with ${productCount} products. Please reassign or delete products first.`
            });
            return;
        }

        await prisma.brand.delete({ where: { id } });

        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete brand' });
    }
});

/** Get brand analytics (Admin only) */
router.get('/:id/analytics', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [brand, productCount, totalRevenue, topProducts] = await Promise.all([
            prisma.brand.findUnique({ where: { id } }),
            prisma.product.count({ where: { brandId: id } }),
            prisma.orderItem.aggregate({
                where: { product: { brandId: id } },
                _sum: { quantity: true }
            }),
            prisma.orderItem.groupBy({
                by: ['productId'],
                where: { product: { brandId: id } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            })
        ]);

        res.json({
            brand,
            productCount,
            totalSold: totalRevenue._sum.quantity || 0,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
