/**
 * Lightweight Cloudinary Helper
 * Replaces the heavy `cloudinary` SDK package with minimal implementation
 * Only includes the features we actually use
 */

import crypto from 'crypto';

interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}

class CloudinaryHelper {
    private config: CloudinaryConfig;

    constructor(config: CloudinaryConfig) {
        this.config = config;
    }

    /**
     * Generate signature for signed uploads
     * Replaces: cloudinary.utils.api_sign_request()
     */
    generateSignature(params: Record<string, string | number>): string {
        // Sort params alphabetically and create param string
        const sortedParams = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join('&');

        // Create signature: SHA1(params + api_secret)
        const stringToSign = `${sortedParams}${this.config.apiSecret}`;
        return crypto.createHash('sha1').update(stringToSign).digest('hex');
    }

    /**
     * Delete image from Cloudinary
     * Replaces: cloudinary.uploader.destroy()
     */
    async deleteImage(publicId: string): Promise<{ result: string }> {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = this.generateSignature({
            public_id: publicId,
            timestamp,
        });

        const formData = new URLSearchParams();
        formData.append('public_id', publicId);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('api_key', this.config.apiKey);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/destroy`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Cloudinary delete failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get configuration values
     */
    getConfig() {
        return {
            cloudName: this.config.cloudName,
            apiKey: this.config.apiKey,
        };
    }
}

// ─── Create Singleton Instance ─────────────────
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export const isCloudinaryConfigured = !!(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
    console.warn(
        '⚠️  Cloudinary credentials missing in .env file.\n' +
        '   Image upload functionality will not work.\n' +
        '   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
}

export const cloudinaryHelper = new CloudinaryHelper({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
});
