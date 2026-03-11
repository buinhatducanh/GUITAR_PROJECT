import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { deleteCloudinaryImages, collectImageUrls } from '../shared/utils/cloudinary-cleanup.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../shared/middleware/auth.js';
import { notifyVoucherReceived } from '../lib/notification.helper.js';

const router = Router();

/** GET /api/vouchers — active vouchers */
router.get('/', async (_req, res) => {
    try {
        const vouchers = await prisma.voucher.findMany({
            where: { isActive: true, expiryDate: { gte: new Date() } },
            orderBy: { pointsCost: 'asc' },
        });
        res.json(vouchers);
    } catch (err) {
        console.error('Get vouchers error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/vouchers — create (admin only) */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const voucher = await prisma.voucher.create({ data: req.body });
        res.status(201).json(voucher);
    } catch (err) {
        console.error('Create voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/vouchers/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const voucher = await prisma.voucher.update({
            where: { id: req.params.id as string },
            data: req.body,
        });
        res.json(voucher);
    } catch (err) {
        console.error('Update voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/vouchers/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const voucher = await prisma.voucher.findUnique({
            where: { id: req.params.id as string },
            select: { image: true },
        });

        await prisma.voucher.delete({ where: { id: req.params.id as string } });

        if (voucher) {
            const urls = collectImageUrls(voucher, ['image']);
            deleteCloudinaryImages(urls).catch(() => { });
        }

        res.json({ message: 'Đã xóa voucher' });
    } catch (err) {
        console.error('Delete voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/vouchers/:id/redeem — user redeems voucher */
router.post('/:id/redeem', authenticate, async (req: AuthRequest, res) => {
    try {
        const voucher = await prisma.voucher.findUnique({ where: { id: req.params.id as string } });
        if (!voucher) {
            res.status(404).json({ error: 'Voucher không tồn tại' });
            return;
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.points < voucher.pointsCost) {
            res.status(400).json({ error: 'Không đủ điểm để đổi voucher' });
            return;
        }

        // Check if already redeemed
        const existing = await prisma.userVoucher.findUnique({
            where: { userId_voucherId: { userId: req.userId!, voucherId: voucher.id } },
        });
        if (existing) {
            res.status(400).json({ error: 'Bạn đã đổi voucher này rồi' });
            return;
        }

        // Transaction: deduct points + create redemption + increment usedCount
        const [updatedUser, userVoucher] = await prisma.$transaction([
            prisma.user.update({
                where: { id: req.userId },
                data: { points: { decrement: voucher.pointsCost } },
            }),
            prisma.userVoucher.create({
                data: { userId: req.userId!, voucherId: voucher.id },
            }),
            prisma.voucher.update({
                where: { id: voucher.id },
                data: { usedCount: { increment: 1 } },
            }),
        ]);

        res.json({ message: 'Đổi voucher thành công', points: updatedUser.points });

        // Notify user about voucher received
        notifyVoucherReceived(req.userId!, voucher.title, voucher.code);
    } catch (err) {
        console.error('Redeem voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/vouchers/validate — validate voucher/event code */
router.post('/validate', async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code) {
            res.json({ valid: false, message: 'Vui lòng nhập mã' });
            return;
        }

        const numericSubtotal = Number(subtotal) || 0;
        const normalizedCode = code.toUpperCase();

        // Extract user ID from token if present
        let userId: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                userId = decoded.userId;
            } catch { }
        }

        // 1. Try to find a voucher
        const voucher = await prisma.voucher.findUnique({
            where: { code: normalizedCode }
        });

        if (voucher) {
            if (!voucher.isActive) {
                res.json({ valid: false, message: 'Mã không hoạt động' });
                return;
            }
            if (new Date(voucher.expiryDate) < new Date()) {
                res.json({ valid: false, message: 'Mã đã hết hạn' });
                return;
            }
            if (voucher.usedCount >= voucher.usageLimit) {
                res.json({ valid: false, message: 'Mã đã hết lượt sử dụng' });
                return;
            }
            if (numericSubtotal < Number(voucher.minPurchase)) {
                res.json({ valid: false, message: `Đơn hàng tối thiểu ${Number(voucher.minPurchase).toLocaleString('vi-VN')}đ` });
                return;
            }

            // Must be owned by the user and not used
            if (!userId) {
                res.json({ valid: false, message: 'Vui lòng đăng nhập để sử dụng mã này' });
                return;
            }
            const userVoucher = await prisma.userVoucher.findUnique({
                where: { userId_voucherId: { userId, voucherId: voucher.id } }
            });
            if (!userVoucher) {
                res.json({ valid: false, message: 'Bạn chưa đổi mã này' });
                return;
            }
            if (userVoucher.isUsed) {
                res.json({ valid: false, message: 'Mã này đã được sử dụng' });
                return;
            }

            let discountAmount = 0;
            if (voucher.discountType === 'PERCENTAGE') {
                discountAmount = (numericSubtotal * voucher.discountValue) / 100;
                if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
                    discountAmount = Number(voucher.maxDiscount);
                }
            } else {
                discountAmount = voucher.discountValue;
            }
            discountAmount = Math.min(discountAmount, numericSubtotal);

            res.json({
                valid: true,
                discountType: voucher.discountType.toLowerCase(),
                discountValue: Number(voucher.discountValue),
                discountAmount: Number(discountAmount),
                voucherId: voucher.id,
                message: 'Áp dụng mã thành công'
            });
            return;
        }

        // 2. Try to find an event if voucher not found
        const activeEvents = await prisma.event.findMany({
            where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } }
        });

        for (const ev of activeEvents) {
            const conditions = ev.conditions as any || {};
            // If the event specifically requires a couple code and this matches
            if (conditions.requireCoupleCode && normalizedCode === 'COUPLE') {
                if (conditions.minPurchase && numericSubtotal < conditions.minPurchase) {
                    res.json({ valid: false, message: `Đơn hàng tối thiểu ${Number(conditions.minPurchase).toLocaleString('vi-VN')}đ` });
                    return;
                }

                let discountAmount = 0;
                if (ev.rewardType === 'DISCOUNT') {
                    discountAmount = (numericSubtotal * ev.rewardValue) / 100;
                    discountAmount = Math.min(discountAmount, numericSubtotal);
                    res.json({
                        valid: true,
                        discountType: 'percentage',
                        discountValue: Number(ev.rewardValue),
                        discountAmount: Number(discountAmount),
                        eventId: ev.id,
                        message: 'Áp dụng mã sự kiện thành công'
                    });
                    return;
                }
            }
        }

        res.json({ valid: false, message: 'Mã không hợp lệ' });
    } catch (err) {
        console.error('Validate voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/vouchers/my-vouchers — user's redeemed vouchers */
router.get('/my-vouchers', authenticate, async (req: AuthRequest, res) => {
    try {
        const redeemed = await prisma.userVoucher.findMany({
            where: { userId: req.userId },
            include: {
                voucher: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        description: true,
                        discountType: true,
                        discountValue: true,
                        pointsCost: true,
                        minPurchase: true,
                        maxDiscount: true,
                        image: true,
                        expiryDate: true,
                    }
                }
            },
            orderBy: { redeemedAt: 'desc' },
        });

        // Format response
        const result = redeemed.map(rv => ({
            id: rv.voucher.id,
            code: rv.voucher.code,
            title: rv.voucher.title,
            description: rv.voucher.description,
            discountType: rv.voucher.discountType.toLowerCase(),
            discountValue: Number(rv.voucher.discountValue),
            minPurchase: Number(rv.voucher.minPurchase),
            maxDiscount: rv.voucher.maxDiscount ? Number(rv.voucher.maxDiscount) : undefined,
            pointsCost: rv.voucher.pointsCost,
            image: rv.voucher.image,
            expiryDate: rv.voucher.expiryDate,
            redeemedAt: rv.redeemedAt,
            isUsed: rv.isUsed,
        }));

        res.json(result);
    } catch (err) {
        console.error('Get my vouchers error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/vouchers/redeem-history — all redemption history (admin only) */
router.get('/redeem-history', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { userId, voucherId } = req.query;

        const where: any = {};
        if (userId) where.userId = userId as string;
        if (voucherId) where.voucherId = voucherId as string;

        const history = await prisma.userVoucher.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, phone: true } },
                voucher: { select: { id: true, title: true, code: true } },
            },
            orderBy: { redeemedAt: 'desc' },
        });

        res.json(history);
    } catch (err) {
        console.error('Get redeem history error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;

