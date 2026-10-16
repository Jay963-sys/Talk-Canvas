import type { ImageLoaderProps } from "next/image";

/**
 * Use this helper on any raw <img> tag (WorkCard, ArchiveCard, ArtistCard, etc.)
 */
export function thumb(url: string, width: 200 | 600 | 1200 = 600): string {
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

/**
 * Global Next.js <Image> loader (automatically wired via next.config.ts)
 */
export default function cloudinaryLoader({
  src,
  width,
}: ImageLoaderProps): string {
  if (!src.startsWith("http")) {
    return src;
  }
  const bucket: 200 | 600 | 1200 =
    width <= 250 ? 200 : width <= 750 ? 600 : 1200;
  return thumb(src, bucket);
}
