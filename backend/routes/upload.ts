import { Router } from 'express';
import cloudinary from '../shared/lib/cloudinary.js';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { extractPublicId } from '../shared/utils/cloudinary-cleanup.js';

const router = Router();

/**
 * POST /api/upload/signature — get signed upload params
 *
 * Tầng 1 (deduplicate): If client sends `hash` (SHA-256 of file),
 * we use it as public_id with overwrite=false so Cloudinary
 * returns the existing URL if the same file was already uploaded.
 */
router.post('/signature', authenticate, async (req: AuthRequest, res) => {
    try {
        const { folder = 'guitar-nova/general', hash } = req.body;

        const timestamp = Math.round(Date.now() / 1000);

        // Build params for signing
        const params: Record<string, any> = { timestamp, folder };

        if (hash) {
            params.public_id = hash;
            params.overwrite = false;
            params.unique_filename = false;
        }

        const signature = cloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET!
        );

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            ...(hash && { publicId: hash, overwrite: false, uniqueFilename: false }),
        });
    } catch (err) {
        console.error('Upload signature error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/upload/orphans — Tầng 3: Scan orphan images
 * Lists all images in Cloudinary guitar-nova/ folder that are
 * NOT referenced by any entity in the database.
 */
router.get('/orphans', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        // 1. Collect all image URLs from all tables
        const [products, banners, blogs, vouchers, events, reviews, users] = await Promise.all([
            prisma.product.findMany({ select: { image: true, images: true } }),
            prisma.banner.findMany({ select: { image: true } }),
            prisma.blogPost.findMany({ select: { coverImage: true, authorAvatar: true } }),
            prisma.voucher.findMany({ select: { image: true } }),
            prisma.event.findMany({ select: { image: true } }),
            prisma.review.findMany({ select: { images: true } }),
            prisma.user.findMany({ select: { avatar: true } }),
        ]);

        const dbPublicIds = new Set<string>();

        const addUrl = (url: string | null | undefined) => {
            if (!url) return;
            const id = extractPublicId(url);
            if (id) dbPublicIds.add(id);
        };

        for (const p of products) {
            addUrl(p.image);
            if (p.images) p.images.forEach(addUrl);
        }
        for (const b of banners) addUrl(b.image);
        for (const b of blogs) { addUrl(b.coverImage); addUrl(b.authorAvatar); }
        for (const v of vouchers) addUrl(v.image);
        for (const e of events) addUrl(e.image);
        for (const r of reviews) if (r.images) r.images.forEach(addUrl);
        for (const u of users) addUrl(u.avatar);

        // 2. List all resources in Cloudinary guitar-nova/ folder
        const cloudinaryImages: { publicId: string; url: string; createdAt: string; bytes: number }[] = [];
        let nextCursor: string | undefined;

        do {
            const result: any = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'guitar-nova/',
                max_results: 500,
                next_cursor: nextCursor,
            });

            for (const resource of result.resources) {
                cloudinaryImages.push({
                    publicId: resource.public_id,
                    url: resource.secure_url,
                    createdAt: resource.created_at,
                    bytes: resource.bytes,
                });
            }

            nextCursor = result.next_cursor;
        } while (nextCursor);

        // 3. Find orphans
        const orphans = cloudinaryImages.filter(img => !dbPublicIds.has(img.publicId));
        const totalBytes = orphans.reduce((sum, img) => sum + img.bytes, 0);

        res.json({
            total: cloudinaryImages.length,
            inUse: cloudinaryImages.length - orphans.length,
            orphanCount: orphans.length,
            orphanSizeMB: +(totalBytes / (1024 * 1024)).toFixed(2),
            orphans,
        });
    } catch (err) {
        console.error('Scan orphans error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/upload/orphans/cleanup — Tầng 3: Delete orphan images
 * Body: { publicIds: string[] } to delete specific orphans
 */
router.post('/orphans/cleanup', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { publicIds } = req.body;

        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            res.status(400).json({ error: 'Cần truyền publicIds (mảng public_id cần xóa)' });
            return;
        }

        // Cloudinary batch delete supports up to 100 at a time
        let totalDeleted = 0;
        for (let i = 0; i < publicIds.length; i += 100) {
            const batch = publicIds.slice(i, i + 100);
            const result = await cloudinary.api.delete_resources(batch);
            totalDeleted += Object.values(result.deleted).filter((v) => v === 'deleted').length;
        }

        res.json({ deleted: totalDeleted, requested: publicIds.length });
    } catch (err) {
        console.error('Cleanup orphans error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/upload/:publicId — delete image from Cloudinary */
router.delete('/*publicId', authenticate, async (req: AuthRequest, res) => {
    try {
        const publicId = Array.isArray(req.params.publicId)
            ? req.params.publicId.join('/')
            : req.params.publicId;
        const result = await cloudinary.uploader.destroy(publicId);
        res.json(result);
    } catch (err) {
        console.error('Delete image error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
