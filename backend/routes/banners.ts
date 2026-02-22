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
        const { image, title, subtitle, link, order, isActive } = req.body;

        const banner = await prisma.banner.create({
            data: {
                image,
                title,
                subtitle: subtitle || '',
                link: link || '/products',
                order: typeof order === 'string' ? parseInt(order) || 0 : (order || 0),
                isActive: isActive ?? true,
            },
        });
        res.status(201).json(banner);
    } catch (err) {
        console.error('Create banner error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/banners/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { image, title, subtitle, link, order, isActive } = req.body;

        const oldBanner = await prisma.banner.findUnique({
            where: { id: req.params.id },
            select: { image: true },
        });

        if (!oldBanner) {
            res.status(404).json({ error: 'Banner không tồn tại' });
            return;
        }

        // Build update data with only allowed fields
        const data: any = {};
        if (image !== undefined) data.image = image;
        if (title !== undefined) data.title = title;
        if (subtitle !== undefined) data.subtitle = subtitle;
        if (link !== undefined) data.link = link;
        if (order !== undefined) data.order = typeof order === 'string' ? parseInt(order) || 0 : order;
        if (isActive !== undefined) data.isActive = isActive;

        const banner = await prisma.banner.update({
            where: { id: req.params.id },
            data,
        });

        // Cleanup old Cloudinary image if replaced
        if (image !== undefined && oldBanner.image && oldBanner.image !== image) {
            deleteCloudinaryImages([oldBanner.image]).catch(() => {});
        }

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
