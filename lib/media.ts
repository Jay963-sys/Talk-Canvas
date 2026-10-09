/**
 * Delivery URLs for review videos stored on Cloudinary. Pure string helpers,
 * so they work in server and client components alike.
 *
 * Phone videos arrive as .mov / HEVC, which many browsers won't play. Asking
 * Cloudinary for an .mp4 makes it convert on the first request (a few seconds
 * the first time anyone plays it, instant afterwards) and cap the width so a
 * 4K clip doesn't get streamed to a phone.
 */
const swapExt = (url: string, ext: string) =>
  url.replace(/\.[a-z0-9]+(\?.*)?$/i, `.${ext}`);

/**
 * Web-friendly mp4, quality picked automatically. 960px wide by default;
 * pass a smaller width for clips that autoplay, to save the visitor's data.
 */
export function videoSrc(url: string, opts: { width?: number } = {}): string {
  const width = opts.width ?? 960;
  return swapExt(
    url.replace(
      "/video/upload/",
      `/video/upload/q_auto:good,w_${width},c_limit/`,
    ),
    "mp4",
  );
}

/** A still from one second in — the cover shown before the video is played. */
export function videoPoster(url: string, width = 900): string {
  return swapExt(
    url.replace(
      "/video/upload/",
      `/video/upload/so_1,w_${width},c_limit,f_jpg,q_auto/`,
    ),
    "jpg",
  );
}
