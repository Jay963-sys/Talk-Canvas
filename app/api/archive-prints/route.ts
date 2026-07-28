import { NextRequest, NextResponse } from "next/server";
import {
  getArchivePage,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import { isArchiveCategory, type ArchiveCategory } from "@/data/collections";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  if (cursorParam && Number.isNaN(cursor)) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  // Unknown values fall through as "no filter" rather than erroring — a stale
  // bookmark should show the whole archive, not a dead page.
  const c = req.nextUrl.searchParams.get("category");
  const category: ArchiveCategory | undefined = isArchiveCategory(c)
    ? c
    : undefined;

  const o = req.nextUrl.searchParams.get("orientation");
  const orientation: ArchiveOrientation | undefined =
    o === "portrait" || o === "landscape" ? o : undefined;

  // Feeds the /prints/sets grid, including its infinite scroll — without this
  // page two of that page would quietly widen back to the whole archive.
  const setsOnly = req.nextUrl.searchParams.get("setsOnly") === "1";

  const page = await getArchivePage(
    cursor,
    undefined,
    category,
    orientation,
    setsOnly,
  );
  return NextResponse.json(page);
}
