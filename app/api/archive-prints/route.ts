import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  getArchivePage,
  withSetPanels,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import { isArchiveCategory, type ArchiveCategory } from "@/data/collections";

const getCachedArchiveFeed = unstable_cache(
  async (
    cursor?: number,
    category?: ArchiveCategory,
    orientation?: ArchiveOrientation,
    setsOnly?: boolean,
  ) => {
    const page = await getArchivePage(
      cursor,
      undefined,
      category,
      orientation,
      setsOnly,
    );
    return withSetPanels(page);
  },
  ["archive-feed-api"],
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

  const data = await getCachedArchiveFeed(
    cursor,
    category,
    orientation,
    setsOnly,
  );

  return NextResponse.json(data);
}
