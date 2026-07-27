import { NextRequest, NextResponse } from "next/server";
import {
  setArchiveVisibility,
  setArchiveCategory,
  deleteArchivePrint,
} from "@/lib/db/queries/archivePrints";
// ⚠️ AUTH: align with app/api/admin/originals/[id]/route.ts.
import { requireSession } from "@/lib/auth-server";
import { isArchiveCategory } from "@/data/collections";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);

  const hasVisibility = typeof body?.isVisible === "boolean";

  // Categories are a closed set now, so an unknown slug is rejected rather than
  // written. A typo used to become a silent one-off category that showed up in
  // the filter bar; now it fails loudly at the edge.
  const hasCategory = body && "category" in body;
  if (hasCategory && !isArchiveCategory(body.category)) {
    return NextResponse.json(
      { error: "Unknown category" },
      { status: 400 },
    );
  }

  if (!hasVisibility && !hasCategory) {
    return NextResponse.json(
      { error: "isVisible (boolean) or category (known slug) required" },
      { status: 400 },
    );
  }

  let row;
  if (hasVisibility) {
    row = await setArchiveVisibility(numId, body.isVisible);
  }
  if (hasCategory) {
    row = await setArchiveCategory(numId, body.category);
  }

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await deleteArchivePrint(numId);
  return new NextResponse(null, { status: 204 });
}
