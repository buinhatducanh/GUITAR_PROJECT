import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/events — list active events */
router.get('/', async (_req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: 'desc' },
        });
        res.json(events);
    } catch (err) {
        console.error('Get events error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/events */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const event = await prisma.event.create({ data: req.body });
        res.status(201).json(event);
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/events/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const event = await prisma.event.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(event);
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/events/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        await prisma.event.delete({ where: { id: req.params.id } });
        res.json({ message: 'Đã xóa sự kiện' });
    } catch (err) {
        console.error('Delete event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
