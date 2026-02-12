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

        const orderNumber = `GN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const order = await prisma.order.create({
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

        res.status(201).json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/orders/:id/status — update status (admin only) */
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id },
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
