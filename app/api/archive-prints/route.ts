import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  getArchiveCatalogue,
  pageFromCatalogue,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import { isArchiveCategory, type ArchiveCategory } from "@/data/collections";

// ONE cache entry for the whole archive, paged in memory below. Keying the
// cache by cursor/filter meant every new page a shopper scrolled to was a
// cache miss that woke Neon.
const getCachedCatalogue = unstable_cache(
  () => getArchiveCatalogue(),
  ["archive-catalogue"],
  { revalidate: 86400, tags: ["archive"] },
);

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

  const catalogue = await getCachedCatalogue();
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
