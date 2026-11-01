import type { ImageLoaderProps } from "next/image";

/**
 * Width buckets. Keep this list short: every distinct width is a separate
 * derived image Cloudinary bills as a transformation.
 *   200  — tiny thumbnails (set strips, compact cards)
 *   400  — grid cards (two-up on phones, four-up on desktop)
 *   600  — single large views and share images
 *   1200 — full-screen / configurator previews
 */
export type ThumbWidth = 200 | 400 | 600 | 1200;

/** Grid cards. Saves ~half the bytes of 600px; most image traffic is here. */
export const CARD_WIDTH: ThumbWidth = 400;

export function thumb(url: string, width: ThumbWidth = 600): string {
  if (
    !url ||
    !url.includes("res.cloudinary.com") ||
    !url.includes("/upload/")
  ) {
    return url;
  }
  if (url.includes("/upload/w_") || url.includes("/upload/f_auto")) {
    return url;
  }
  return url.replace(
    "/upload/",
    `/upload/w_${width},c_limit,f_auto,q_auto:eco/`,
  );
}

export default function cloudinaryLoader({
  src,
  width,
}: ImageLoaderProps): string {
  if (!src.startsWith("http")) {
    return src;
  }
  const bucket: ThumbWidth =
    width <= 250 ? 200 : width <= 450 ? 400 : width <= 750 ? 600 : 1200;
  return thumb(src, bucket);
}
