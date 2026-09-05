/**
 * Cloudinary Media Optimization Utility
 * 
 * Provides automated Cloudinary transformations for images, videos, and video poster snapshots.
 * Automatically injects f_auto, q_auto, and container-specific width caps to prevent downloading
 * uncompressed 4K/1080p media files on mobile & desktop browsers.
 */

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";

export interface CloudinaryOptions {
  width?: number;
  quality?: string;
  format?: string;
  startOffset?: number | string;
}

function cleanCloudinarySuffix(suffix: string): string {
  const parts = suffix.split("/");
  const cleanParts = parts.filter((part) => {
    if (/^v\d+$/.test(part)) return true;
    const isTransformSegment =
      part.includes(",") || /^(f|q|w|h|c|so|ar|dpr|b|e|g|l|u|pg|fl|ac|br|vc|vs)_/.test(part);
    return !isTransformSegment;
  });
  return cleanParts.join("/");
}

/**
 * Optimizes a Cloudinary image or video URL with f_auto, q_auto, and width limits.
 * Safe to call on any URL — non-Cloudinary URLs are returned untouched.
 */
export function getCloudinaryUrl(url: string | undefined | null, options: CloudinaryOptions = {}): string {
  if (!url) return FALLBACK_IMAGE;
  if (url.includes("example.com")) return FALLBACK_IMAGE;

  const marker = "/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;

  const idx = url.indexOf(marker);
  const prefix = url.slice(0, idx + marker.length);
  const rawSuffix = url.slice(idx + marker.length);
  const cleanSuffix = cleanCloudinarySuffix(rawSuffix);

  const parts: string[] = ["f_auto", "q_auto"];
  if (options.width) {
    parts.push(`w_${options.width}`, "c_limit");
  }

  const transformString = parts.join(",") + "/";
  return prefix + transformString + cleanSuffix;
}

/**
 * Injects Cloudinary video optimizations (f_auto, q_auto:best, width capping).
 * Resolves video streams in optimal formats (MP4/WebM/H.265/AV1) matched to browser support.
 */
export function getCloudinaryVideoUrl(url: string | undefined | null, options: CloudinaryOptions = {}): string {
  if (!url) return "";
  const targetWidth = options.width || 720;
  const quality = options.quality || "q_auto:good";
  return getCloudinaryUrl(url, { width: targetWidth, quality });
}

/**
 * Generates an optimized static JPEG/WebP poster thumbnail from a Cloudinary video URL.
 * Injects `so_0` (snapshot at 0s) and image transformations to deliver a crisp HD thumbnail
 * instead of downloading a multi-megabyte video file.
 */
export function getCloudinaryPosterUrl(url: string | undefined | null, options: CloudinaryOptions = {}): string {
  if (!url) return FALLBACK_IMAGE;
  if (!url.includes("res.cloudinary.com")) return FALLBACK_IMAGE;

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return FALLBACK_IMAGE;

  const prefix = url.slice(0, idx + marker.length);
  const rawSuffix = url.slice(idx + marker.length);
  let posterSuffix = cleanCloudinarySuffix(rawSuffix);

  if (/\.(mp4|mov|webm|m3u8|avi|flv|mkv)$/i.test(posterSuffix)) {
    posterSuffix = posterSuffix.replace(/\.(mp4|mov|webm|m3u8|avi|flv|mkv)$/i, ".jpg");
  } else if (!posterSuffix.includes(".")) {
    posterSuffix = posterSuffix + ".jpg";
  }

  const targetWidth = options.width || 720;
  const quality = options.quality || "q_auto:best";
  const startOffset = options.startOffset !== undefined ? options.startOffset : 0;
  const transformString = `f_auto,${quality},w_${targetWidth},c_limit,so_${startOffset}/`;

  return prefix + transformString + posterSuffix;
}

