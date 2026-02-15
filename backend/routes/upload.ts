import { Router } from 'express';
import { cloudinaryHelper, isCloudinaryConfigured } from '../lib/cloudinaryHelper.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** POST /api/upload/signature — get signed upload params */
router.post('/signature', authenticate, async (req: AuthRequest, res) => {
    try {
        if (!isCloudinaryConfigured) {
            return res.status(503).json({
                error: 'Cloudinary not configured. Please check environment variables.',
            });
        }

        const { folder = 'guitar-nova/general' } = req.body;

        const timestamp = Math.round(Date.now() / 1000);
        const signature = cloudinaryHelper.generateSignature({ timestamp, folder });
        const config = cloudinaryHelper.getConfig();

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: config.cloudName,
            apiKey: config.apiKey,
        });
    } catch (err) {
        console.error('Upload signature error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/upload/:publicId — delete image from Cloudinary */
router.delete('/:publicId', authenticate, async (req: AuthRequest, res) => {
    try {
        if (!isCloudinaryConfigured) {
            return res.status(503).json({
                error: 'Cloudinary not configured',
            });
        }

        const publicId = decodeURIComponent(req.params.publicId as string);
        const result = await cloudinaryHelper.deleteImage(publicId);

        if (result.result === 'ok') {
            res.json({ result: 'ok', message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found or already deleted' });
        }
    } catch (err) {
        console.error('Delete image error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
