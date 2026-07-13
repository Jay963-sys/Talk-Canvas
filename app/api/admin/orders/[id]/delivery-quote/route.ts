import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getOrderById } from "@/lib/db/queries/orders";
import { setDeliveryQuote } from "@/lib/db/queries/orders";

/**
 * Record the agreed delivery fee for an outside-Lagos order. The gallery
 * quotes the customer by hand, then enters the figure here — it updates the
 * shipping line and the order total, and clears the pending flag.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const order = await getOrderById(numId);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!order.deliveryQuotePending) {
      return NextResponse.json(
        { error: "This order doesn't need a delivery quote." },
        { status: 400 },
      );
    }

    const { shipping } = await req.json();
    const fee = Math.round(Number(shipping));
    if (!Number.isFinite(fee) || fee < 0) {
      return NextResponse.json(
        { error: "Enter a valid delivery fee." },
        { status: 400 },
      );
    }

    // Total is recomputed from the order's own stored figures — the discount
    // was already applied when the order was placed.
    const newTotal = order.subtotal - order.discountAmount + fee;

    const updated = await setDeliveryQuote(numId, fee, newTotal);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${numId}`);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Set delivery quote error:", err);
    return NextResponse.json(
      { error: "Failed to save the quote" },
      { status: 500 },
    );
  }
}
