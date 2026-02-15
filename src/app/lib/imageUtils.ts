/**
 * Image Optimization Utilities
 * Provides helpers for Cloudinary URL transformations and lazy loading
 */

/**
 * Cloudinary transformation options
 */
interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Extract Cloudinary public ID from full URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg
 * Returns: folder/image
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Match pattern: /upload/{version}/{publicId}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com/');
}

/**
 * Build Cloudinary transformation string
 */
function buildTransformationString(options: CloudinaryOptions): string {
  const parts: string[] = [];

  // Auto format and quality for best optimization
  if (options.format) {
    parts.push(`f_${options.format}`);
  }
  if (options.quality) {
    parts.push(`q_${options.quality}`);
  }

  // Dimensions
  if (options.width) {
    parts.push(`w_${options.width}`);
  }
  if (options.height) {
    parts.push(`h_${options.height}`);
  }

  // Crop mode
  if (options.crop) {
    parts.push(`c_${options.crop}`);
  }

  // Gravity (focus point)
  if (options.gravity) {
    parts.push(`g_${options.gravity}`);
  }

  return parts.join(',');
}

/**
 * Optimize Cloudinary URL with transformations
 * Automatically adds f_auto, q_auto for best performance
 */
export function getOptimizedImageUrl(
  url: string,
  options: CloudinaryOptions = {}
): string {
  if (!url) return url;
  if (!isCloudinaryUrl(url)) return url;

  // Default optimizations
  const defaultOptions: CloudinaryOptions = {
    format: 'auto',
    quality: 'auto',
    ...options,
  };

  const transformStr = buildTransformationString(defaultOptions);

  // Insert transformations after /upload/
  return url.replace(/\/upload\//, `/upload/${transformStr}/`);
}

/**
 * Preset optimization configurations
 */
export const ImagePresets = {
  /** Thumbnail - small square image */
  thumbnail: (url: string) =>
    getOptimizedImageUrl(url, { width: 150, height: 150, crop: 'thumb', gravity: 'auto' }),

  /** Product card - medium size */
  productCard: (url: string) =>
    getOptimizedImageUrl(url, { width: 400, crop: 'fit' }),

  /** Product detail - large responsive */
  productDetail: (url: string) =>
    getOptimizedImageUrl(url, { width: 800, crop: 'fit' }),

  /** Hero banner - full width */
  hero: (url: string) =>
    getOptimizedImageUrl(url, { width: 1920, height: 800, crop: 'fill' }),

  /** Blog cover - medium */
  blogCover: (url: string) =>
    getOptimizedImageUrl(url, { width: 600, height: 400, crop: 'fill' }),

  /** Avatar - small circle */
  avatar: (url: string) =>
    getOptimizedImageUrl(url, { width: 100, height: 100, crop: 'thumb', gravity: 'face' }),
};

/**
 * Generate responsive srcSet for different screen sizes
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200]): string {
  if (!isCloudinaryUrl(url)) return '';

  return widths
    .map((width) => `${getOptimizedImageUrl(url, { width })} ${width}w`)
    .join(', ');
}

/**
 * Get placeholder/blur image (low quality, small size for LQIP)
 */
export function getPlaceholderUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;

  return getOptimizedImageUrl(url, {
    width: 20,
    quality: 30,
    format: 'auto',
  });
}
