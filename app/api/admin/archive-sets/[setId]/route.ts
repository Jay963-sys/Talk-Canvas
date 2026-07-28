import { NextRequest, NextResponse } from "next/server";
import { dissolveArchiveSet } from "@/lib/db/queries/archivePrints";
import { requireSession } from "@/lib/auth-server";

/**
 * Ungroup a set. The prints themselves survive as individual archive pieces —
 * this only cuts the link, unlike deleting a set piece, which takes the whole
 * set with it.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { setId } = await params;
  const numId = Number(setId);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid set id" }, { status: 400 });
  }

  await dissolveArchiveSet(numId);
  return new NextResponse(null, { status: 204 });
}
