import { NextRequest, NextResponse } from "next/server";
import {
  setArchiveVisibility,
  deleteArchivePrint,
} from "@/lib/db/queries/archivePrints";
// ⚠️ AUTH: align with app/api/admin/originals/[id]/route.ts.
import { requireSession } from "@/lib/auth-server";

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
  if (typeof body?.isVisible !== "boolean") {
    return NextResponse.json(
      { error: "isVisible (boolean) required" },
      { status: 400 },
    );
  }

  const row = await setArchiveVisibility(numId, body.isVisible);
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
