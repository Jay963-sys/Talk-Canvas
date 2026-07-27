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

  const page = await getArchivePage(cursor, undefined, category, orientation);
  return NextResponse.json(page);
}
