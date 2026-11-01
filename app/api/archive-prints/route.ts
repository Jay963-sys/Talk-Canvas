import { NextRequest, NextResponse } from "next/server";
import {
  pageFromCatalogue,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import { getCachedArchiveCatalogue } from "@/lib/db/publicCache";
import { isArchiveCategory, type ArchiveCategory } from "@/data/collections";

// ONE cache entry for the whole archive (shared with the archive pages), paged
// in memory below. Keying the cache by cursor/filter meant every new page a
// shopper scrolled to was a cache miss that woke Neon.

export async function GET(req: NextRequest) {
  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  if (cursorParam && Number.isNaN(cursor)) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  const c = req.nextUrl.searchParams.get("category");
  const category: ArchiveCategory | undefined = isArchiveCategory(c)
    ? c
    : undefined;

  const o = req.nextUrl.searchParams.get("orientation");
  const orientation: ArchiveOrientation | undefined =
    o === "portrait" || o === "landscape" ? o : undefined;

  const setsOnly = req.nextUrl.searchParams.get("setsOnly") === "1";

  const catalogue = await getCachedArchiveCatalogue();
  const data = pageFromCatalogue(
    catalogue,
    cursor,
    undefined,
    category,
    orientation,
    setsOnly,
  );

  return NextResponse.json(data);
}
