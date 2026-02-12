import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/landing-pages — published pages */
router.get('/', async (_req, res) => {
    try {
        const pages = await prisma.landingPage.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(pages);
    } catch (err) {
        console.error('Get landing pages error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/landing-pages/all — all pages (admin) */
router.get('/all', authenticate, requireAdmin, async (_req: AuthRequest, res) => {
    try {
        const pages = await prisma.landingPage.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(pages);
    } catch (err) {
        console.error('Get all landing pages error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/landing-pages/:slug */
router.get('/:slug', async (req, res) => {
    try {
        const page = await prisma.landingPage.findUnique({
            where: { slug: req.params.slug },
        });

        if (!page) {
            res.status(404).json({ error: 'Trang không tồn tại' });
            return;
        }

        res.json(page);
    } catch (err) {
        console.error('Get landing page error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/landing-pages */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const page = await prisma.landingPage.create({ data: req.body });
        res.status(201).json(page);
    } catch (err) {
        console.error('Create landing page error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/landing-pages/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const page = await prisma.landingPage.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(page);
    } catch (err) {
        console.error('Update landing page error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/landing-pages/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        await prisma.landingPage.delete({ where: { id: req.params.id } });
        res.json({ message: 'Đã xóa trang' });
    } catch (err) {
        console.error('Delete landing page error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
