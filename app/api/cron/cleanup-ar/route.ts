import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { deleteArModelsCreatedBefore } from "@/lib/db/queries/arModels";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily clean-up of AR frame models (scheduled in vercel.json).
 *
 * Every AR preview of a new design/frame/size/crop uploads a .glb (and on
 * iOS a .usdz) to Cloudinary. They were never removed, so storage — which
 * Cloudinary bills as credits — grew every day. Models are cheap to rebuild
 * (a few seconds on the shopper's phone), so anything older than
 * RETENTION_DAYS is deleted and simply regenerated if someone views it again.
 *
 * Only raw files named talk-canvas/prints/frame-* are touched. Customer
 * uploads and artwork images are image resources and are never listed here.
 */
const RETENTION_DAYS = 7;
const PREFIX = "talk-canvas/prints/frame-";
const MAX_DELETIONS_PER_RUN = 2000;

export async function GET(req: NextRequest) {
  // Vercel sends this header on scheduled runs when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400_000);

  // 1. Database first, with an hour's margin: a cache row is written just
  //    after its file is uploaded, so this guarantees no remaining row points
  //    at a file deleted in step 2.
  const rowsDeleted = await deleteArModelsCreatedBefore(
    new Date(cutoff.getTime() + 3600_000),
  );

  // 2. Find expired model files.
  const expired: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await cloudinary.api.resources({
      resource_type: "raw",
      type: "upload",
      prefix: PREFIX,
      max_results: 500,
      next_cursor: cursor,
    });
    for (const r of page.resources as { public_id: string; created_at: string }[]) {
      if (new Date(r.created_at) < cutoff) expired.push(r.public_id);
    }
    cursor = page.next_cursor;
  } while (cursor && expired.length < MAX_DELETIONS_PER_RUN);

  // 3. Delete them, 100 per call (the Admin API limit).
  const toDelete = expired.slice(0, MAX_DELETIONS_PER_RUN);
  let filesDeleted = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    const res = await cloudinary.api.delete_resources(batch, {
      resource_type: "raw",
      type: "upload",
    });
    filesDeleted += Object.values(res.deleted ?? {}).filter(
      (v) => v === "deleted",
    ).length;
  }

  return NextResponse.json({ rowsDeleted, filesDeleted, cutoff });
}
