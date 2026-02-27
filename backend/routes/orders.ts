import { Router } from 'express';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { notifyNewOrder, notifyOrderStatusChangeSSE } from '../lib/notifications.js';
import { notifyOrderPlaced, notifyOrderStatusChange, notifyPointsEarned } from '../lib/notification.helper.js';

const router = Router();

const orderGuestLimiter = rateLimit({
    windowMs: 60_000,  // 1 phút
    max: 3,            // Max 3 đơn/phút cho guest
    message: 'Bạn đã đặt quá nhiều đơn hàng. Vui lòng thử lại sau 1 phút.',
});

const orderAuthLimiter = rateLimit({
    windowMs: 60_000,  // 1 phút
    max: 5,            // Max 5 đơn/phút cho user đăng nhập
    message: 'Bạn đã đặt quá nhiều đơn hàng. Vui lòng thử lại sau 1 phút.',
});

/** POST /api/orders/guest — create order without auth (guest checkout) */
router.post('/guest', orderGuestLimiter, async (req, res) => {
    try {
        const { guestName, phone, items, address, notes, totalAmount, voucherCode } = req.body;

        if (!phone || !items?.length || !address || !totalAmount) {
            res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
            return;
        }

        const numericTotal = Number(totalAmount);
        let finalAmount = numericTotal;
        let discountAmount = 0;
        let validVoucherId: string | undefined;

        // Verify voucher if provided (Guest can only use Event vouchers)
        if (voucherCode) {
            const normalizedCode = voucherCode.toUpperCase();
            const activeEvents = await prisma.event.findMany({
                where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } }
            });
            for (const ev of activeEvents) {
                const conditions = ev.conditions as any || {};
                if (conditions.requireCoupleCode && normalizedCode === 'COUPLE') {
                    if (!conditions.minPurchase || numericTotal >= conditions.minPurchase) {
                        if (ev.rewardType === 'DISCOUNT') {
                            discountAmount = (numericTotal * ev.rewardValue) / 100;
                            discountAmount = Math.min(discountAmount, numericTotal);
                            finalAmount -= discountAmount;
                        }
                    }
                }
            }
        }

        // Find or create user by phone
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    name: guestName || `KH_${phone.slice(-4)}`,
                    password: randomUUID(),
                },
            });
        }

        const orderNumber = `GN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                totalAmount: finalAmount,
                address,
                phone,
                notes,
                voucherCode: voucherCode || undefined,
                discountAmount: discountAmount || undefined,
                voucherId: validVoucherId || undefined,
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

        // Notify user (persistent + SSE)
        notifyOrderPlaced(user.id, orderNumber);

        // Notify admins via SSE
        notifyNewOrder(order);
    } catch (err: any) {
        console.error('Create guest order error:', err?.message || err);
        console.error('Full error:', JSON.stringify(err, null, 2));
        res.status(500).json({ error: 'Lỗi server', detail: err?.message });
    }
});

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
router.post('/', authenticate, orderAuthLimiter, async (req: AuthRequest, res) => {
    try {
        const { items, address, phone, notes, totalAmount, voucherCode } = req.body;

        const numericTotal = Number(totalAmount);
        let finalAmount = numericTotal;
        let discountAmount = 0;
        let validVoucherId: string | undefined;
        let isPointVoucher = false;

        if (voucherCode) {
            const normalizedCode = voucherCode.toUpperCase();

            // 1. Try Voucher
            const voucher = await prisma.voucher.findUnique({ where: { code: normalizedCode } });
            if (voucher && voucher.isActive && new Date(voucher.expiryDate) >= new Date() && voucher.usedCount < voucher.usageLimit) {
                if (numericTotal >= Number(voucher.minPurchase)) {
                    const userVoucher = await prisma.userVoucher.findUnique({
                        where: { userId_voucherId: { userId: req.userId!, voucherId: voucher.id } }
                    });

                    if (userVoucher && !userVoucher.isUsed) {
                        if (voucher.discountType === 'PERCENTAGE') {
                            discountAmount = (numericTotal * voucher.discountValue) / 100;
                            if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
                                discountAmount = Number(voucher.maxDiscount);
                            }
                        } else {
                            discountAmount = voucher.discountValue;
                        }
                        discountAmount = Math.min(discountAmount, numericTotal);
                        finalAmount -= discountAmount;
                        validVoucherId = voucher.id;
                        isPointVoucher = true;
                    }
                }
            } else {
                // 2. Try Event
                const activeEvents = await prisma.event.findMany({
                    where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } }
                });
                for (const ev of activeEvents) {
                    const conditions = ev.conditions as any || {};
                    if (conditions.requireCoupleCode && normalizedCode === 'COUPLE') {
                        if (!conditions.minPurchase || numericTotal >= conditions.minPurchase) {
                            if (ev.rewardType === 'DISCOUNT') {
                                discountAmount = (numericTotal * ev.rewardValue) / 100;
                                discountAmount = Math.min(discountAmount, numericTotal);
                                finalAmount -= discountAmount;
                            }
                        }
                    }
                }
            }
        }

        const orderNumber = `GN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId: req.userId!,
                    totalAmount: finalAmount,
                    address,
                    phone,
                    notes,
                    voucherCode: voucherCode || undefined,
                    discountAmount: discountAmount || undefined,
                    voucherId: validVoucherId || undefined,
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

            if (isPointVoucher && validVoucherId) {
                await tx.userVoucher.update({
                    where: { userId_voucherId: { userId: req.userId!, voucherId: validVoucherId } },
                    data: { isUsed: true }
                });
                await tx.voucher.update({
                    where: { id: validVoucherId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            return newOrder;
        });

        res.status(201).json(order);

        // Notify user (persistent + SSE)
        notifyOrderPlaced(req.userId!, orderNumber);

        // Notify admins via SSE
        notifyNewOrder(order);
    } catch (err) {
        console.error('Create order error:', err);
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

        // Notify user about status change (persistent + SSE)
        notifyOrderStatusChange(order.userId, order.orderNumber, req.body.status);

        // Notify admins via SSE
        notifyOrderStatusChangeSSE({
            id: order.id,
            orderNumber: order.orderNumber,
            status: req.body.status,
        });

        // Award points on delivery
        if (req.body.status === 'DELIVERED') {
            const pointsToAward = Math.floor(Number(order.totalAmount) / 10000); // 1 point per 10,000 VND
            if (pointsToAward > 0) {
                await prisma.user.update({
                    where: { id: order.userId },
                    data: { points: { increment: pointsToAward } }
                });
                notifyPointsEarned(
                    order.userId,
                    pointsToAward,
                    `Hoàn thành đơn hàng ${order.orderNumber}`
                );
            }
        }

        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
