import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────

/** Get site settings */
router.get('/', async (_req: Request, res: Response) => {
    try {
        // Get first (and only) settings record
        let settings = await prisma.siteSettings.findFirst();

        // If no settings exist, create default
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: 'Guitar NOVA',
                    slogan: 'Nơi Đam Mê Âm Nhạc Thăng Hoa',
                    metaTitle: 'Guitar NOVA - Premium Guitar Store',
                    metaDescription: 'Cửa hàng guitar chính hãng, chất lượng cao',
                    paymentMethods: ['COD', 'Bank Transfer', 'Credit Card']
                }
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// ─── Admin Routes ─────────────────────────────────────────

/** Update site settings (Admin only) */
router.put('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const {
            siteName,
            slogan,
            logo,
            favicon,
            email,
            phone,
            address,
            facebookUrl,
            instagramUrl,
            youtubeUrl,
            tiktokUrl,
            metaTitle,
            metaDescription,
            metaKeywords,
            businessHours,
            paymentMethods,
            shippingInfo
        } = req.body;

        // Get existing settings
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            // Create if doesn't exist
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: siteName || 'Guitar NOVA',
                    slogan,
                    logo,
                    favicon,
                    email,
                    phone,
                    address,
                    facebookUrl,
                    instagramUrl,
                    youtubeUrl,
                    tiktokUrl,
                    metaTitle,
                    metaDescription,
                    metaKeywords,
                    businessHours,
                    paymentMethods,
                    shippingInfo
                }
            });
        } else {
            // Update existing
            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: {
                    ...(siteName && { siteName }),
                    ...(slogan !== undefined && { slogan }),
                    ...(logo !== undefined && { logo }),
                    ...(favicon !== undefined && { favicon }),
                    ...(email !== undefined && { email }),
                    ...(phone !== undefined && { phone }),
                    ...(address !== undefined && { address }),
                    ...(facebookUrl !== undefined && { facebookUrl }),
                    ...(instagramUrl !== undefined && { instagramUrl }),
                    ...(youtubeUrl !== undefined && { youtubeUrl }),
                    ...(tiktokUrl !== undefined && { tiktokUrl }),
                    ...(metaTitle !== undefined && { metaTitle }),
                    ...(metaDescription !== undefined && { metaDescription }),
                    ...(metaKeywords !== undefined && { metaKeywords }),
                    ...(businessHours !== undefined && { businessHours }),
                    ...(paymentMethods !== undefined && { paymentMethods }),
                    ...(shippingInfo !== undefined && { shippingInfo })
                }
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
