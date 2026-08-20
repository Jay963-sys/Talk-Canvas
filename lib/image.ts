/**
 * Downscale + re-encode an image in the browser before upload.
 *
 * Archive images are display assets — they feed the grid (served at w_600),
 * the framed preview, and the AR texture (which ARModal forces to w_1200,
 * f_jpg). None of that needs a 40MB master, so we cap the long edge and
 * re-encode as JPEG. This keeps every file comfortably under Cloudinary's
 * per-upload limit and slashes storage + bandwidth as the collection grows.
 *
 * The gallery prints from its own catalogue originals, so nothing is lost by
 * not storing full-resolution files here.
 */

export interface DownscaleOptions {
  /**
   * Trim a uniform light border before encoding. Designers export some
   * artworks onto a white canvas, so the file ships with white margins (the
   * source of the "white border on the mockup" reports). Off by default —
   * only the admin archive path passes it, since customer uploads carry no
   * watermark and their own framing should be left alone.
   */
  trim?: boolean;
}

// Trim tuning — validated against watermark-over-white margins. The low
// per-pixel tolerance keeps genuinely light artwork safe; the fraction
// threshold is what lets a mostly-white margin trim despite a sprinkle of
// watermark pixels sitting on it.
const TRIM_TOL = 35; // max RGB distance from the border colour to count as border
const TRIM_FRAC = 0.7; // a row/col trims only if this fraction is border-coloured
const TRIM_MAX_SIDE = 0.45; // never eat more than this share of a dimension
const TRIM_MAX_EDGE = 0.3; // bail entirely if any raw edge exceeds this — a
// runaway trim means high-key art (light on white) with no real border to find
const TRIM_CORNER_MIN = 235; // corners must be at least this light, or we don't trim

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Largest content rectangle after trimming a uniform light border. Returns the
 * full frame (no trim) when the corners aren't a light border, or when trimming
 * would consume the image — so a dark-background design is never touched.
 */
function computeTrim(data: Uint8ClampedArray, W: number, H: number): Rect {
  const full: Rect = { x: 0, y: 0, w: W, h: H };
  if (W < 8 || H < 8) return full;

  // Border colour = average of the four 8×8 corner blocks.
  let br = 0,
    bg = 0,
    bb = 0,
    n = 0;
  const corners: [number, number][] = [
    [0, 0],
    [W - 8, 0],
    [0, H - 8],
    [W - 8, H - 8],
  ];
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + 8; y++) {
      for (let x = cx; x < cx + 8; x++) {
        const i = (y * W + x) * 4;
        br += data[i];
        bg += data[i + 1];
        bb += data[i + 2];
        n++;
      }
    }
  }
  br /= n;
  bg /= n;
  bb /= n;

  // If the border isn't actually light, there's nothing to trim.
  if (Math.min(br, bg, bb) < TRIM_CORNER_MIN) return full;

  const tol2 = TRIM_TOL * TRIM_TOL;
  const rowCount = new Int32Array(H);
  const colCount = new Int32Array(W);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const dr = data[i] - br;
      const dg = data[i + 1] - bg;
      const db = data[i + 2] - bb;
      if (dr * dr + dg * dg + db * db <= tol2) {
        rowCount[y]++;
        colCount[x]++;
      }
    }
  }

  const rowThresh = TRIM_FRAC * W;
  const colThresh = TRIM_FRAC * H;
  const firstContent = (count: Int32Array, len: number, thresh: number) => {
    let i = 0;
    while (i < len && count[i] >= thresh) i++;
    return i;
  };
  const lastContent = (count: Int32Array, len: number, thresh: number) => {
    let i = len - 1;
    while (i >= 0 && count[i] >= thresh) i--;
    return i;
  };

  let top = firstContent(rowCount, H, rowThresh);
  let bottom = H - 1 - lastContent(rowCount, H, rowThresh);
  let left = firstContent(colCount, W, colThresh);
  let right = W - 1 - lastContent(colCount, W, colThresh);

  // If any side wants to trim more than TRIM_MAX_EDGE, there's no clean border
  // here — the image is high-key and the trim would eat artwork. Leave it whole;
  // a light edge in the frame is the art, not a defect.
  if (
    top > H * TRIM_MAX_EDGE ||
    bottom > H * TRIM_MAX_EDGE ||
    left > W * TRIM_MAX_EDGE ||
    right > W * TRIM_MAX_EDGE
  ) {
    return full;
  }

  const maxV = Math.floor(H * TRIM_MAX_SIDE);
  const maxH = Math.floor(W * TRIM_MAX_SIDE);
  top = Math.min(top, maxV);
  bottom = Math.min(bottom, maxV);
  left = Math.min(left, maxH);
  right = Math.min(right, maxH);

  const w = W - left - right;
  const h = H - top - bottom;
  if (w <= 0 || h <= 0) return full; // image reads as all-border — leave it
  if (left === 0 && right === 0 && top === 0 && bottom === 0) return full;
  return { x: left, y: top, w, h };
}

export async function downscaleImage(
  file: File,
  maxDim = 2400,
  quality = 0.85,
  opts: DownscaleOptions = {},
): Promise<File> {
  // Only raster images can go through a canvas; pass anything else straight on.
  if (!file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    // from-image applies EXIF orientation so portrait shots don't come out sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // decode failed — let the upload path surface the error
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));

  // Already small in both dimensions and bytes — no point re-encoding. Skipped
  // when trimming, since we still need a canvas pass to find and cut the border.
  if (!opts.trim && scale === 1 && file.size <= 8 * 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let out = canvas;
  if (opts.trim) {
    const rect = computeTrim(ctx.getImageData(0, 0, w, h).data, w, h);
    if (rect.w !== w || rect.h !== h) {
      const cropped = document.createElement("canvas");
      cropped.width = rect.w;
      cropped.height = rect.h;
      const cctx = cropped.getContext("2d");
      if (cctx) {
        cctx.drawImage(
          canvas,
          rect.x,
          rect.y,
          rect.w,
          rect.h,
          0,
          0,
          rect.w,
          rect.h,
        );
        out = cropped;
      }
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    out.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
