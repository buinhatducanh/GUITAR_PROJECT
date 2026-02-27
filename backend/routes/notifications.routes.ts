import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { broadcastNotificationToAll, createNotification } from '../lib/notification.helper.js';
import { addUserClient } from '../lib/notifications.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'guitar-nova-secret-2024';
const router = Router();

/** GET /api/notifications — Get user's notifications with pagination & filtering */
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const type = req.query.type as string | undefined;
        const unreadOnly = req.query.unread === 'true';

        const where: any = { userId: req.userId };
        if (type) where.type = type;
        if (unreadOnly) where.isRead = false;

        // Exclude expired notifications
        where.OR = [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
        ];

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.notification.count({ where }),
        ]);

        res.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });
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
                isRead: false,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
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
        const result = await prisma.notification.updateMany({
            where: {
                userId: req.userId,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/notifications/:id/read — Mark a specific notification as read */
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
    try {
        const id = req.params.id as string;

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

/** DELETE /api/notifications/:id — Delete a specific notification */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const id = req.params.id as string;

        const notification = await prisma.notification.findFirst({
            where: { id, userId: req.userId }
        });

        if (!notification) {
            res.status(404).json({ error: 'Không tìm thấy thông báo' });
            return;
        }

        await prisma.notification.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/notifications — Delete all read notifications for user */
router.delete('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const result = await prisma.notification.deleteMany({
            where: {
                userId: req.userId,
                isRead: true,
            }
        });
        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Delete read notifications error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/notifications/admin/broadcast — Admin sends notification to all users */
router.post('/admin/broadcast', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { type, title, message, link, priority } = req.body;

        if (!title || !message) {
            res.status(400).json({ error: 'Cần có tiêu đề và nội dung thông báo' });
            return;
        }

        const result = await broadcastNotificationToAll(
            type || 'SYSTEM',
            title,
            message,
            link,
            priority || 'NORMAL'
        );

        res.json({ success: true, count: result?.count || 0 });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/notifications/admin/send — Admin sends notification to specific user */
router.post('/admin/send', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { userId, type, title, message, link, priority } = req.body;

        if (!userId || !title || !message) {
            res.status(400).json({ error: 'Cần có userId, tiêu đề và nội dung thông báo' });
            return;
        }

        const notification = await createNotification(
            userId,
            type || 'SYSTEM',
            title,
            message,
            link,
            priority || 'NORMAL'
        );

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/notifications/admin/stats — Get notification stats */
router.get('/admin/stats', authenticate, requireAdmin, async (_req: AuthRequest, res) => {
    try {
        const [totalNotifications, unreadNotifications, typeBreakdown] = await Promise.all([
            prisma.notification.count(),
            prisma.notification.count({ where: { isRead: false } }),
            prisma.notification.groupBy({
                by: ['type'],
                _count: { type: true },
                orderBy: { _count: { type: 'desc' } },
            }),
        ]);

        res.json({
            total: totalNotifications,
            unread: unreadNotifications,
            byType: typeBreakdown.map(t => ({ type: t.type, count: t._count.type })),
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/notifications/stream/user — SSE stream for user-specific notifications */
router.get('/stream/user', (req, res) => {
    // Extract token from query param for SSE (EventSource can't set headers)
    const token = req.query.token as string;
    if (!token) {
        res.status(401).json({ error: 'Token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        addUserClient(req, res, decoded.userId);
    } catch {
        res.status(401).json({ error: 'Token không hợp lệ' });
    }
});

export default router;
