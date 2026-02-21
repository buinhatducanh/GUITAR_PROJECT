import cloudinary from '../lib/cloudinary.js';

/**
 * Extract Cloudinary public_id from a full URL.
 * Example: https://res.cloudinary.com/demo/image/upload/v123/guitar-nova/products/abc123.jpg
 *       → guitar-nova/products/abc123
 */
export function extractPublicId(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/**
 * Delete a single image from Cloudinary by URL.
 * Returns true if deleted, false if skipped (not a Cloudinary URL).
 */
export async function deleteCloudinaryImage(url: string): Promise<boolean> {
    const publicId = extractPublicId(url);
    if (!publicId) return false;

    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (err) {
        console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
        return false;
    }
}

/**
 * Delete multiple images from Cloudinary by URLs.
 * Non-Cloudinary URLs are silently skipped.
 */
export async function deleteCloudinaryImages(urls: string[]): Promise<number> {
    const publicIds = urls
        .map(extractPublicId)
        .filter((id): id is string => id !== null);

    if (publicIds.length === 0) return 0;

    let deleted = 0;
    await Promise.allSettled(
        publicIds.map(async (id) => {
            try {
                await cloudinary.uploader.destroy(id);
                deleted++;
            } catch (err) {
                console.error(`Failed to delete Cloudinary image ${id}:`, err);
            }
        })
    );

    return deleted;
}

/**
 * Collect all Cloudinary image URLs from an entity record.
 * Handles both single string fields and string[] arrays.
 */
export function collectImageUrls(record: Record<string, any>, fields: string[]): string[] {
    const urls: string[] = [];
    for (const field of fields) {
        const value = record[field];
        if (!value) continue;
        if (Array.isArray(value)) {
            urls.push(...value.filter((v: any) => typeof v === 'string'));
        } else if (typeof value === 'string') {
            urls.push(value);
        }
    }
    return urls;
}
