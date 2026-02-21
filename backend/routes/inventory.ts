import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── Admin Routes ─────────────────────────────────────────

/** Get inventory overview (Admin only) */
router.get('/', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const [totalProducts, outOfStockCount, totalStock, lowStockResult] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { stock: 0 } }),
            prisma.product.aggregate({ _sum: { stock: true } }),
            // Column-to-column compare not supported in Prisma where — use raw SQL
            prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::bigint AS count FROM "products"
                WHERE stock > 0 AND stock <= "lowStockAlert"
            `,
        ]);

        res.json({
            totalProducts,
            lowStockCount: Number(lowStockResult[0]?.count ?? 0),
            outOfStockCount,
            totalStock: totalStock._sum.stock || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory overview' });
    }
});

/** Get low stock products (Admin only) */
router.get('/low-stock', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { limit = '50' } = req.query;

        // Column-to-column compare not supported in Prisma where — use raw SQL for IDs
        const lowStockIds = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "products"
            WHERE stock > 0 AND stock <= "lowStockAlert"
            ORDER BY stock ASC
            LIMIT ${parseInt(limit as string)}
        `;

        const products = lowStockIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: lowStockIds.map(r => r.id) } },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                    stock: true,
                    lowStockAlert: true,
                    category: { select: { name: true } },
                    brand: { select: { name: true } },
                },
                orderBy: { stock: 'asc' },
            })
            : [];

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
});

/** Get out of stock products (Admin only) */
router.get('/out-of-stock', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { limit = '50' } = req.query;

        const products = await prisma.product.findMany({
            where: { stock: 0 },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                category: {
                    select: { name: true }
                },
                brand: {
                    select: { name: true }
                },
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: parseInt(limit as string)
        });

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch out of stock products' });
    }
});

/** Adjust product stock (Admin only) */
router.post('/adjust', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity, type, reason, notes } = req.body;
        const adjustReason = reason || notes; // support both field names

        if (!productId || quantity === undefined || !type) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Get current product
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const previousQty = product.stock;
        let newQty = previousQty;

        // Calculate new quantity based on type
        switch (type) {
            case 'IN':
            case 'RETURN':
                newQty = previousQty + Math.abs(quantity);
                break;
            case 'OUT':
                newQty = Math.max(0, previousQty - Math.abs(quantity));
                break;
            case 'ADJUSTMENT':
                newQty = Math.max(0, quantity);
                break;
            default:
                res.status(400).json({ error: 'Invalid stock change type' });
                return;
        }

        // Update product stock and create history record
        const [updatedProduct, stockHistory] = await prisma.$transaction([
            prisma.product.update({
                where: { id: productId },
                data: { stock: newQty }
            }),
            prisma.stockHistory.create({
                data: {
                    productId,
                    type,
                    quantity: Math.abs(quantity),
                    previousQty,
                    newQty,
                    reason: adjustReason,
                    createdBy: req.userId
                }
            })
        ]);

        res.json({
            product: updatedProduct,
            history: stockHistory,
            message: `Stock ${type.toLowerCase()}: ${previousQty} → ${newQty}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to adjust stock' });
    }
});

/** Get stock history for a product (Admin only) */
router.get('/history/:productId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const productId = req.params.productId as string;
        const { limit = '50', offset = '0' } = req.query;

        const history = await prisma.stockHistory.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string)
        });

        const total = await prisma.stockHistory.count({
            where: { productId }
        });

        res.json({ history, total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock history' });
    }
});

/** Bulk stock update (Admin only) */
router.post('/bulk-update', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { updates } = req.body; // [{ productId, quantity, type, reason }]

        if (!Array.isArray(updates) || updates.length === 0) {
            res.status(400).json({ error: 'Invalid updates array' });
            return;
        }

        const results = await Promise.all(
            updates.map(async (update) => {
                const { productId, quantity, type, reason } = update;

                const product = await prisma.product.findUnique({
                    where: { id: productId }
                });

                if (!product) return { productId, status: 'not_found' };

                const previousQty = product.stock;
                let newQty = previousQty;

                switch (type) {
                    case 'IN':
                    case 'RETURN':
                        newQty = previousQty + Math.abs(quantity);
                        break;
                    case 'OUT':
                        newQty = Math.max(0, previousQty - Math.abs(quantity));
                        break;
                    case 'ADJUSTMENT':
                        newQty = Math.max(0, quantity);
                        break;
                }

                const [updatedProduct, stockHistory] = await prisma.$transaction([
                    prisma.product.update({
                        where: { id: productId },
                        data: { stock: newQty }
                    }),
                    prisma.stockHistory.create({
                        data: {
                            productId,
                            type,
                            quantity: Math.abs(quantity),
                            previousQty,
                            newQty,
                            reason,
                            createdBy: req.userId
                        }
                    })
                ]);

                return {
                    productId,
                    status: 'success',
                    previousQty,
                    newQty
                };
            })
        );

        res.json({
            message: `Bulk update completed`,
            results
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to bulk update stock' });
    }
});

export default router;
