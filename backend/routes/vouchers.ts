import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

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
        await prisma.voucher.delete({ where: { id: req.params.id as string } });
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
    } catch (err) {
        console.error('Redeem voucher error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
