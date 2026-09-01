import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCloudinaryUrl, getCloudinaryVideoUrl, getCloudinaryPosterUrl } from "./cloudinary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { getCloudinaryUrl, getCloudinaryVideoUrl, getCloudinaryPosterUrl };
