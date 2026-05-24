// app/api/cloudinary/sign/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "talk-canvas/prints";

  // Existing image/GLB uploads call this with NO body — that path is unchanged.
  // The USDZ upload sends { ext: "usdz" } so the delivered raw URL ends in
  // ".usdz", which iOS AR Quick Look requires to open the file as AR.
  let ext: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body.ext === "string") ext = body.ext;
  } catch {
    // no body / not JSON — fine, behaves exactly as before
  }

  // Params that must be covered by the signature (sorted by Cloudinary).
  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  let publicId: string | undefined;
  if (ext) {
    const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase();
    // Unique, relative to `folder`, and crucially carries the extension.
    publicId = `frame-${timestamp}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    paramsToSign.public_id = publicId;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    publicId, // undefined for the image/GLB callers
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
