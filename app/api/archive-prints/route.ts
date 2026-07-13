import { NextRequest, NextResponse } from "next/server";
import {
  getArchivePage,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  if (cursorParam && Number.isNaN(cursor)) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  const collection = req.nextUrl.searchParams.get("collection") ?? undefined;

  const o = req.nextUrl.searchParams.get("orientation");
  const orientation: ArchiveOrientation | undefined =
    o === "portrait" || o === "landscape" ? o : undefined;

  const page = await getArchivePage(cursor, undefined, collection, orientation);
  return NextResponse.json(page);
}
