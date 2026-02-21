import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { deleteCloudinaryImages, collectImageUrls } from '../shared/utils/cloudinary-cleanup.js';

const router = Router();

/** GET /api/banners — active banners (public) or all banners (admin) */
router.get('/', async (req, res) => {
    try {
        // If admin passes ?all=true, return all banners including inactive
        const showAll = req.query.all === 'true';
        const banners = await prisma.banner.findMany({
            where: showAll ? {} : { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.json(banners);
    } catch (err) {
        console.error('Get banners error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/banners */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const banner = await prisma.banner.create({ data: req.body });
        res.status(201).json(banner);
    } catch (err) {
        console.error('Create banner error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/banners/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const banner = await prisma.banner.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(banner);
    } catch (err) {
        console.error('Update banner error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/banners/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const banner = await prisma.banner.findUnique({
            where: { id: req.params.id },
            select: { image: true },
        });

        await prisma.banner.delete({ where: { id: req.params.id } });

        if (banner) {
            const urls = collectImageUrls(banner, ['image']);
            deleteCloudinaryImages(urls).catch(() => {});
        }

        res.json({ message: 'Đã xóa banner' });
    } catch (err) {
        console.error('Delete banner error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
