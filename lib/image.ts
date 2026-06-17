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
export async function downscaleImage(
  file: File,
  maxDim = 2400,
  quality = 0.85,
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

  // Already small in both dimensions and bytes — no point re-encoding.
  if (scale === 1 && file.size <= 8 * 1024 * 1024) {
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

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
