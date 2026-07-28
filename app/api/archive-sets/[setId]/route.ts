import { NextRequest, NextResponse } from "next/server";
import { getArchiveSet } from "@/lib/db/queries/archivePrints";

export const dynamic = "force-dynamic";

/**
 * The panels of one set, in hanging order.
 *
 * The grid feed only carries the canonical panel — sending every panel of every
 * set would bloat a page the customer mostly scrolls past. The configurator
 * fetches the rest at the moment a set is actually chosen.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  const { setId } = await params;
  const numId = Number(setId);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid set id" }, { status: 400 });
  }

  const pieces = await getArchiveSet(numId);

  // A single-panel or partly hidden set isn't sellable under the gallery's
  // all-or-nothing rule, so it reads as gone rather than as a set of one.
  if (pieces.length < 2 || pieces.some((p) => !p.isVisible)) {
    return NextResponse.json({ error: "Set not available" }, { status: 404 });
  }

  return NextResponse.json({
    setId: numId,
    pieces: pieces.map((p) => ({
      imageUrl: p.imageUrl,
      imagePublicId: p.imagePublicId,
      width: p.width,
      height: p.height,
    })),
  });
}
