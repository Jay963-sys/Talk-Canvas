import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { originals } from "@/lib/db/schema";
import {
  quoteDeliveryByDistance,
  type DeliverablePiece,
} from "@/lib/deliveryCalc";

/**
 * Checkout preview of the delivery fee.
 *
 * Runs on the server so originals are sized from their real dimensions in the
 * database — the cart doesn't carry them. That's the same data the order route
 * prices from, so the preview and the charge can't disagree. The order route
 * still re-resolves the address and recomputes everything; nothing sent here
 * is trusted for payment.
 */
type QuoteItem = {
  originalId?: number | null;
  sizeId?: string | null;
  quantity?: number;
  setSize?: number;
  isSet?: boolean;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const items: QuoteItem[] = Array.isArray(body.items)
    ? body.items.slice(0, 100)
    : [];
  const km =
    typeof body.km === "number" && Number.isFinite(body.km) ? body.km : null;
  const inLagos = typeof body.inLagos === "boolean" ? body.inLagos : null;

  const originalIds = [
    ...new Set(
      items
        .map((i) => i.originalId)
        .filter((id): id is number => Number.isInteger(id)),
    ),
  ];
  const dims = originalIds.length
    ? await db
        .select({
          id: originals.id,
          widthInches: originals.widthInches,
          heightInches: originals.heightInches,
        })
        .from(originals)
        .where(inArray(originals.id, originalIds))
    : [];
  const dimsById = new Map(dims.map((d) => [d.id, d]));

  const pieces: DeliverablePiece[] = items.map((i) => {
    const original =
      i.originalId != null ? dimsById.get(i.originalId) : undefined;
    return {
      sizeId: typeof i.sizeId === "string" ? i.sizeId : null,
      widthInches: original?.widthInches ?? null,
      heightInches: original?.heightInches ?? null,
      quantity: Math.max(1, Math.min(999, Number(i.quantity) || 1)),
      setSize: Math.max(1, Math.min(20, Number(i.setSize) || 1)),
      isSet: Boolean(i.isSet),
    };
  });

  return NextResponse.json(quoteDeliveryByDistance({ km, inLagos }, pieces));
}
