import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getOrderById, recordBalancePayment } from "@/lib/db/queries/orders";

/**
 * Record a payment received outside Paystack, e.g. the delivery fee paid by
 * transfer after a quote. Adds to the order's amountPaid; the payment status
 * is re-derived (unpaid / part paid / paid) from that vs the order total.
 */
export async function POST(
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
    if (order.deliveryQuotePending) {
      return NextResponse.json(
        { error: "Record the delivery quote first, so the balance is known." },
        { status: 400 },
      );
    }

    const { amount } = await req.json();
    const naira = Math.round(Number(amount));
    const balance = order.total - order.amountPaid;
    if (!Number.isFinite(naira) || naira <= 0) {
      return NextResponse.json(
        { error: "Enter a valid amount." },
        { status: 400 },
      );
    }
    if (naira > balance) {
      return NextResponse.json(
        {
          error: `That's more than the balance due (₦${balance.toLocaleString("en-NG")}).`,
        },
        { status: 400 },
      );
    }

    const updated = await recordBalancePayment(numId, naira);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${numId}`);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Record payment error:", err);
    return NextResponse.json(
      { error: "Failed to record the payment" },
      { status: 500 },
    );
  }
}
