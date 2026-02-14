import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/orders — user's orders or all (admin) */
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const where = req.userRole === 'ADMIN' ? {} : { userId: req.userId };

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/orders — create order */
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { items, address, phone, notes, totalAmount } = req.body;

        if (!items?.length || !address || !phone) {
            res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
            return;
        }

        const orderNumber = `GN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        // Use transaction to create order + decrement stock atomically
        const order = await prisma.$transaction(async (tx) => {
            // Check stock availability for all items
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true },
                });
                if (!product) {
                    throw new Error(`Sản phẩm không tồn tại: ${item.name}`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`);
                }
            }

            // Decrement stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // Create order
            return tx.order.create({
                data: {
                    orderNumber,
                    userId: req.userId!,
                    totalAmount,
                    address,
                    phone,
                    notes,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: { items: true },
            });
        });

        res.status(201).json(order);
    } catch (err: any) {
        console.error('Create order error:', err);
        const message = err?.message?.startsWith('Sản phẩm') ? err.message : 'Lỗi server';
        res.status(err?.message?.startsWith('Sản phẩm') ? 400 : 500).json({ error: message });
    }
});

/** GET /api/orders/:id — single order */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id as string },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, image: true, slug: true } },
                    },
                },
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!order) {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
            return;
        }

        // Non-admin can only view their own orders
        if (req.userRole !== 'ADMIN' && order.userId !== req.userId) {
            res.status(403).json({ error: 'Không có quyền truy cập' });
            return;
        }

        res.json(order);
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/orders/:id/status — update status (admin only) */
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id as string },
            data: { status: req.body.status },
            include: { items: true },
        });
        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
