import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/notifications — Get user's notifications */
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to 50 most recent notifications
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/notifications/unread-count — Get number of unread notifications */
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId: req.userId,
                isRead: false
            }
        });
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/notifications/read-all — Mark all as read */
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.userId,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/notifications/:id/read — Mark a specific notification as read */
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
    try {
        const id = req.params.id as string;

        // Ensure user owns this notification
        const notification = await prisma.notification.findFirst({
            where: { id, userId: req.userId }
        });

        if (!notification) {
            res.status(404).json({ error: 'Không tìm thấy thông báo' });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
