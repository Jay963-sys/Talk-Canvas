import type { PrintSize, Orientation } from "@/data/sizes";
import { orientInches } from "@/data/sizes";

/**
 * A crop is stored as a rectangle of the *source* image, expressed as fractions
 * (0..1) of the natural pixel dimensions. It's resolution-independent, so the
 * same rect drives the live preview, the cart thumbnail, the AR texture, and
 * the full-resolution file the gallery prints — all from one Cloudinary asset.
 */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Dim {
  w: number;
  h: number;
}

export const FULL_CROP: Crop = { x: 0, y: 0, w: 1, h: 1 };

const EPS = 0.001;

/** A crop that trims nothing — lets callers skip the transform entirely. */
export function isFullCrop(c: Crop | null | undefined): boolean {
  if (!c) return true;
  return (
    Math.abs(c.x) < EPS &&
    Math.abs(c.y) < EPS &&
    Math.abs(c.w - 1) < EPS &&
    Math.abs(c.h - 1) < EPS
  );
}

/** Pixel aspect ratio (w / h) the print wants, oriented to the artwork. */
export function targetAspect(
  size: PrintSize,
  orientation: Orientation,
): number {
  const { w, h } = orientInches(size, orientation);
  return w / h;
}

/** Largest centred crop of the given aspect that fits inside the image. */
export function defaultCrop(natural: Dim, aspect: number): Crop {
  if (!natural.w || !natural.h || !aspect) return { ...FULL_CROP };
  const srcAR = natural.w / natural.h;
  let w = 1;
  let h = 1;
  if (srcAR > aspect) {
    // Source is wider than the frame — keep full height, trim the sides.
    w = aspect / srcAR;
  } else {
    // Source is taller — keep full width, trim top and bottom.
    h = srcAR / aspect;
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/**
 * Fraction of the image kept by the best-fit (cover) crop. This is the shape
 * signal: 1.0 when the image and the size share proportions, dropping as they
 * diverge. Independent of how far the customer has zoomed in.
 */
export function coverKeptFraction(natural: Dim, aspect: number): number {
  const c = defaultCrop(natural, aspect);
  return c.w * c.h;
}

/** Cloudinary c_crop component in the source's pixel space, clamped to bounds. */
export function cropTransform(crop: Crop, natural: Dim): string {
  const NW = Math.max(1, Math.round(natural.w));
  const NH = Math.max(1, Math.round(natural.h));
  const w = Math.min(NW, Math.max(1, Math.round(crop.w * NW)));
  const h = Math.min(NH, Math.max(1, Math.round(crop.h * NH)));
  const x = Math.min(NW - w, Math.max(0, Math.round(crop.x * NW)));
  const y = Math.min(NH - h, Math.max(0, Math.round(crop.y * NH)));
  return `c_crop,x_${x},y_${y},w_${w},h_${h}`;
}

/**
 * Insert an ordered chain of transforms right after /upload/. Order matters —
 * Cloudinary applies components left to right, so a crop must precede any
 * resize, or the crop coordinates land in the wrong pixel space.
 */
export function cloudinaryChain(url: string, transforms: string[]): string {
  const parts = transforms.filter(Boolean);
  if (!url || url.startsWith("blob:") || parts.length === 0) return url;
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${parts.join("/")}/`);
}

/** A print-resolution URL with the crop baked in (no downscale). */
export function withCrop(url: string, crop: Crop | null, natural: Dim): string {
  if (!crop || isFullCrop(crop)) return url;
  return cloudinaryChain(url, [cropTransform(crop, natural)]);
}

// ── Resolution guidance ─────────────────────────────────────────────
// Wall art is viewed at a distance, so the bar sits well below the 300 DPI
// "print in hand" rule. ~150 reads crisp; below ~100 softness gets visible.
// NOTE: uploads are downscaled to a 4000px long edge in StepUpload, which caps
// achievable DPI on the largest sizes — these warnings surface that honestly.
export const PRINT_DPI_GOOD = 150;
export const PRINT_DPI_MIN = 100;

/** DPI the kept region actually prints at, for this size + crop. */
export function effectiveDpi(
  natural: Dim,
  crop: Crop | null,
  size: PrintSize,
  orientation: Orientation,
): number {
  const { w: tw, h: th } = orientInches(size, orientation);
  const c = crop ?? FULL_CROP;
  const keptW = c.w * natural.w;
  const keptH = c.h * natural.h;
  return Math.floor(Math.min(keptW / tw, keptH / th));
}

/** Best-case DPI if the whole image were used — for the size-picker hints. */
export function bestDpi(
  natural: Dim,
  size: PrintSize,
  orientation: Orientation,
): number {
  const { w: tw, h: th } = orientInches(size, orientation);
  return Math.floor(Math.min(natural.w / tw, natural.h / th));
}
