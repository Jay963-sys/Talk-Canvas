import type { PrintSize, Orientation } from "@/data/sizes";
import { orientInches } from "@/data/sizes";

/**
 * A crop is stored as a rectangle expressed as fractions (0..1). With no
 * rotation it's a rectangle of the *source* image, exactly as before. With a
 * rotation it's a rectangle of the image's *rotated bounding-box canvas* — the
 * frame turns the artwork by `rotation` degrees first, then keeps this window
 * of the result. Either way it's resolution-independent, so the same rect
 * drives the live preview, the cart thumbnail, the AR texture, and the
 * full-resolution file the gallery prints — all from one Cloudinary asset.
 */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Clockwise degrees. Absent or 0 means no rotation, and x/y/w/h are plain
   * source fractions (fully backward-compatible with saved crops). When set,
   * x/y/w/h are fractions of the rotated canvas — see rotatedCanvas().
   */
  rotation?: number;
}

export interface Dim {
  w: number;
  h: number;
}

export const FULL_CROP: Crop = { x: 0, y: 0, w: 1, h: 1 };

const EPS = 0.001;

/** Clockwise degrees folded into [0, 360), rounded to a whole degree. */
export function normalizeDeg(deg: number): number {
  return ((Math.round(deg) % 360) + 360) % 360;
}

/** A crop that trims nothing — lets callers skip the transform entirely. */
export function isFullCrop(c: Crop | null | undefined): boolean {
  if (!c) return true;
  // Any rotation always changes the image, so it's never a no-op.
  if (normalizeDeg(c.rotation ?? 0) !== 0) return false;
  return (
    Math.abs(c.x) < EPS &&
    Math.abs(c.y) < EPS &&
    Math.abs(c.w - 1) < EPS &&
    Math.abs(c.h - 1) < EPS
  );
}

/**
 * Dimensions of the bounding box after rotating a `natural`-sized image by
 * `deg` degrees. This is the canvas Cloudinary's `a_<deg>` produces and the
 * space a rotated crop's x/y/w/h are measured in.
 */
export function rotatedCanvas(natural: Dim, deg: number): Dim {
  const t = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(t));
  const s = Math.abs(Math.sin(t));
  return {
    w: natural.w * c + natural.h * s,
    h: natural.w * s + natural.h * c,
  };
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
 * Largest centred crop of `aspect`, in rotated-canvas fractions, that still
 * lands entirely on real artwork after a `deg` rotation (never on the fill
 * that `a_<deg>` adds to the corners). This is the "zoomed all the way out"
 * state for the given angle and the ceiling for the zoom slider.
 */
export function coverForRotation(
  natural: Dim,
  aspect: number,
  deg: number,
): Crop {
  if (!natural.w || !natural.h || !aspect)
    return { ...FULL_CROP, rotation: deg };
  const t = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(t));
  const s = Math.abs(Math.sin(t));
  // Widest window of this aspect whose rotated footprint fits inside W×H.
  const wfull = Math.min(
    natural.w / (c + s / aspect),
    natural.h / (s + c / aspect),
  );
  const hw = wfull / 2;
  const hh = hw / aspect;
  const { w: Wc, h: Hc } = rotatedCanvas(natural, deg);
  return {
    x: (Wc / 2 - hw) / Wc,
    y: (Hc / 2 - hh) / Hc,
    w: (2 * hw) / Wc,
    h: (2 * hh) / Hc,
    rotation: deg,
  };
}

/**
 * Push a crop back inside the artwork. For an unrotated crop this is the plain
 * "keep it in [0,1]" clamp; for a rotated one it keeps all four corners off the
 * rotation fill, by constraining the crop's centre within the rotated
 * rectangle. Preserves w/h/rotation — only x/y move.
 */
export function clampCrop(crop: Crop, natural: Dim): Crop {
  const deg = crop.rotation ?? 0;
  const { w: Wc, h: Hc } = rotatedCanvas(natural, deg);
  const hw = (crop.w * Wc) / 2;
  const hh = (crop.h * Hc) / 2;

  let cx = crop.x * Wc + hw;
  let cy = crop.y * Hc + hh;
  let u = cx - Wc / 2;
  let v = cy - Hc / 2;

  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  // Centre in the rotated rectangle's own frame.
  let U = c * u + s * v;
  let V = -s * u + c * v;

  const ac = Math.abs(c);
  const as = Math.abs(s);
  const Umax = Math.max(0, natural.w / 2 - (ac * hw + as * hh));
  const Vmax = Math.max(0, natural.h / 2 - (as * hw + ac * hh));
  U = Math.max(-Umax, Math.min(Umax, U));
  V = Math.max(-Vmax, Math.min(Vmax, V));

  // Back to canvas coordinates.
  u = c * U - s * V;
  v = s * U + c * V;
  cx = Wc / 2 + u;
  cy = Hc / 2 + v;

  return { ...crop, x: (cx - hw) / Wc, y: (cy - hh) / Hc };
}

/**
 * Fraction of the image kept by the best-fit (cover) crop. This is the shape
 * signal: 1.0 when the image and the size share proportions, dropping as they
 * diverge. Independent of how far the customer has zoomed in, and — since it's
 * a soft "your image is a different shape" hint — of any rotation.
 */
export function coverKeptFraction(natural: Dim, aspect: number): number {
  const c = defaultCrop(natural, aspect);
  return c.w * c.h;
}

/**
 * Cloudinary crop component(s) for a crop, in the correct pixel space. Unrotated
 * crops emit a plain `c_crop` in the source's space (unchanged). Rotated crops
 * emit `a_<deg>/c_crop,…` — rotate first, then crop the rotated canvas — with a
 * 1px safety inset so the window never samples the rotation fill.
 */
export function cropTransform(crop: Crop, natural: Dim): string {
  const deg = normalizeDeg(crop.rotation ?? 0);

  if (deg === 0) {
    const NW = Math.max(1, Math.round(natural.w));
    const NH = Math.max(1, Math.round(natural.h));
    const w = Math.min(NW, Math.max(1, Math.round(crop.w * NW)));
    const h = Math.min(NH, Math.max(1, Math.round(crop.h * NH)));
    const x = Math.min(NW - w, Math.max(0, Math.round(crop.x * NW)));
    const y = Math.min(NH - h, Math.max(0, Math.round(crop.y * NH)));
    return `c_crop,x_${x},y_${y},w_${w},h_${h}`;
  }

  const { w: Wc, h: Hc } = rotatedCanvas(natural, deg);
  const RW = Math.max(1, Math.round(Wc));
  const RH = Math.max(1, Math.round(Hc));
  let w = Math.min(RW, Math.max(1, Math.round(crop.w * RW)));
  let h = Math.min(RH, Math.max(1, Math.round(crop.h * RH)));
  let x = Math.min(RW - w, Math.max(0, Math.round(crop.x * RW)));
  let y = Math.min(RH - h, Math.max(0, Math.round(crop.y * RH)));
  // Shave a pixel off every edge so integer rounding can't nudge the window
  // onto the triangular fill the rotation adds at the corners.
  x += 1;
  y += 1;
  w = Math.max(1, w - 2);
  h = Math.max(1, h - 2);
  return `a_${deg}/c_crop,x_${x},y_${y},w_${w},h_${h}`;
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

/** A print-resolution URL with the crop (and any rotation) baked in. */
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
