import React, { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet, isCloudinaryUrl } from '../../lib/imageUtils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Preset sizes for responsive images */
  sizes?: string;
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** Show loading skeleton */
  showSkeleton?: boolean;
}

/**
 * Optimized Image component with:
 * - Automatic Cloudinary transformations (f_auto, q_auto)
 * - Lazy loading by default
 * - Responsive srcSet for different screen sizes
 * - Loading skeleton
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  lazy = true,
  showSkeleton = true,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Optimize URL if it's a Cloudinary URL
  const optimizedSrc = isCloudinaryUrl(src)
    ? getOptimizedImageUrl(src, { width, height })
    : src;

  // Generate srcSet for responsive images
  const srcSet = isCloudinaryUrl(src) && width
    ? generateSrcSet(src, [Math.floor(width * 0.5), width, Math.floor(width * 1.5)])
    : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-white/40 text-xs">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {showSkeleton && !isLoaded && (
        <div
          className={`absolute inset-0 bg-zinc-800 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}

      {/* Actual image */}
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${!isLoaded && showSkeleton ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};
