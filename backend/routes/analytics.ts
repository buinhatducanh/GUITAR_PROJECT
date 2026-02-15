import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Admin Routes ─────────────────────────────────────────

/** Get overview analytics (Admin only) */
router.get('/overview', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const [
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders
        ] = await Promise.all([
            prisma.order.aggregate({
                _sum: { totalAmount: true }
            }),
            prisma.order.count(),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.product.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            })
        ]);

        res.json({
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overview analytics' });
    }
});

/** Get revenue analytics (Admin only) */
router.get('/revenue', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { period = 'month' } = req.query; // day, week, month, year

        let groupBy: string;
        let dateFormat: string;

        switch (period) {
            case 'day':
                groupBy = 'DATE(created_at)';
                dateFormat = 'YYYY-MM-DD';
                break;
            case 'week':
                groupBy = 'DATE_TRUNC(\'week\', created_at)';
                dateFormat = 'YYYY-[W]WW';
                break;
            case 'year':
                groupBy = 'DATE_TRUNC(\'year\', created_at)';
                dateFormat = 'YYYY';
                break;
            case 'month':
            default:
                groupBy = 'DATE_TRUNC(\'month\', created_at)';
                dateFormat = 'YYYY-MM';
        }

        // Get revenue data (simplified - in production use raw SQL)
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                }
            },
            select: {
                totalAmount: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by period (simplified aggregation)
        const revenueByPeriod: { [key: string]: number } = {};
        orders.forEach(order => {
            const date = order.createdAt;
            let key: string;

            switch (period) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    // Simplified week grouping
                    key = date.toISOString().split('T')[0].substring(0, 8) + '01';
                    break;
                case 'year':
                    key = date.getFullYear().toString();
                    break;
                case 'month':
                default:
                    key = date.toISOString().substring(0, 7);
            }

            revenueByPeriod[key] = (revenueByPeriod[key] || 0) + parseFloat(order.totalAmount.toString());
        });

        res.json({
            period,
            data: Object.entries(revenueByPeriod).map(([date, revenue]) => ({
                date,
                revenue
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch revenue analytics' });
    }
});

/** Get product performance (Admin only) */
router.get('/products', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        // Top selling products
        const topSelling = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 10
        });

        // Get product details
        const productIds = topSelling.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                image: true,
                price: true,
                category: { select: { name: true } },
                brand: { select: { name: true } }
            }
        });

        const topProducts = topSelling.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...product,
                totalSold: item._sum.quantity || 0
            };
        });

        res.json({ topProducts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product analytics' });
    }
});

/** Get customer analytics (Admin only) */
router.get('/customers', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const [
            totalCustomers,
            newCustomers,
            vipCustomers,
            activeCustomers,
            topCustomers
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    segment: 'NEW'
                }
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    segment: 'VIP'
                }
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    segment: 'ACTIVE'
                }
            }),
            prisma.user.findMany({
                where: { role: 'USER' },
                orderBy: { totalSpent: 'desc' },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    totalSpent: true,
                    orderCount: true,
                    segment: true,
                    tier: true
                }
            })
        ]);

        res.json({
            totalCustomers,
            newCustomers,
            vipCustomers,
            activeCustomers,
            topCustomers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer analytics' });
    }
});

/** Get brand performance (Admin only) */
router.get('/brands', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const brands = await prisma.brand.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        // Get sales by brand
        const brandPerformance = await Promise.all(
            brands.map(async (brand) => {
                const salesData = await prisma.orderItem.aggregate({
                    where: {
                        product: { brandId: brand.id }
                    },
                    _sum: {
                        quantity: true
                    }
                });

                return {
                    id: brand.id,
                    name: brand.name,
                    logo: brand.logo,
                    productCount: brand._count.products,
                    totalSold: salesData._sum.quantity || 0
                };
            })
        );

        // Sort by total sold
        brandPerformance.sort((a, b) => b.totalSold - a.totalSold);

        res.json({ brands: brandPerformance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch brand analytics' });
    }
});

/** Get category performance (Admin only) */
router.get('/categories', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        const categoryPerformance = await Promise.all(
            categories.map(async (category) => {
                const salesData = await prisma.orderItem.aggregate({
                    where: {
                        product: { categoryId: category.id }
                    },
                    _sum: {
                        quantity: true
                    }
                });

                return {
                    id: category.id,
                    name: category.name,
                    productCount: category._count.products,
                    totalSold: salesData._sum.quantity || 0
                };
            })
        );

        categoryPerformance.sort((a, b) => b.totalSold - a.totalSold);

        res.json({ categories: categoryPerformance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category analytics' });
    }
});

export default router;
