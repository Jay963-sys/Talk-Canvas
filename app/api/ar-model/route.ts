import { NextRequest, NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";
import { getArModel, upsertArModel } from "@/lib/db/queries/arModels";

export const dynamic = "force-dynamic";

const getCachedArModel = unstable_cache(
  (key: string) => getArModel(key),
  ["ar-model"],
  { revalidate: 86400, tags: ["ar-model"] },
);

// Models are uploaded to Cloudinary's raw/upload endpoint. Only allow caching
// URLs that match that shape, so a malicious client can't poison the cache
// with arbitrary third-party URLs that other shoppers would then load.
function isCloudinaryRawUrl(u: unknown): u is string {
  return (
    typeof u === "string" &&
    /^https:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload\//.test(u)
  );
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }
  const row = await getCachedArModel(key);
  return NextResponse.json(row); // null on miss
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { cacheKey, glbUrl, usdzUrl } = body ?? {};

  if (typeof cacheKey !== "string" || !cacheKey) {
    return NextResponse.json({ error: "cacheKey required" }, { status: 400 });
  }
  if (!isCloudinaryRawUrl(glbUrl)) {
    return NextResponse.json({ error: "Invalid glbUrl" }, { status: 400 });
  }
  if (usdzUrl != null && !isCloudinaryRawUrl(usdzUrl)) {
    return NextResponse.json({ error: "Invalid usdzUrl" }, { status: 400 });
  }

  await upsertArModel({ cacheKey, glbUrl, usdzUrl: usdzUrl ?? null });
  revalidateTag("ar-model", { expire: 0 });
  return NextResponse.json({ ok: true });
}
