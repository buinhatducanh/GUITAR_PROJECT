import { Router } from 'express';
import cloudinary from '../lib/cloudinary.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** POST /api/upload/signature — get signed upload params */
router.post('/signature', authenticate, async (req: AuthRequest, res) => {
    try {
        const { folder = 'guitar-nova/general' } = req.body;

        const timestamp = Math.round(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET!
        );

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    } catch (err) {
        console.error('Upload signature error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/upload/:publicId — delete image from Cloudinary */
router.delete('/:publicId', authenticate, async (req: AuthRequest, res) => {
    try {
        const result = await cloudinary.uploader.destroy(req.params.publicId);
        res.json(result);
    } catch (err) {
        console.error('Delete image error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
