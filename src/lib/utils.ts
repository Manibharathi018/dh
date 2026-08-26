import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Injects Cloudinary f_auto,q_auto transformation into a Cloudinary image URL.
 * This auto-converts HEIC/TIFF/etc. to the best browser-supported format (WebP/JPEG).
 * Safe to call on any URL — non-Cloudinary URLs are returned unchanged.
 */
export function getCloudinaryUrl(url: string | undefined | null): string {
  if (!url) return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
  if (url.includes("example.com")) return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
  const marker = "/upload/";
  if (!url.includes("res.cloudinary.com") || url.includes("f_auto")) return url;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  return url.slice(0, idx + marker.length) + "f_auto,q_auto/" + url.slice(idx + marker.length);
}
