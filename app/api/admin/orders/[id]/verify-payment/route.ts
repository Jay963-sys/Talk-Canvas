import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getOrderById } from "@/lib/db/queries/orders";
import { checkPaystackPayment } from "@/lib/orders/verifyPayment";

/** Staff check one unpaid order against Paystack. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!numId)
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const order = await getOrderById(numId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!order.paymentReference) {
    return NextResponse.json(
      { error: "This order has no Paystack reference to check." },
      { status: 400 },
    );
  }

  const result = await checkPaystackPayment(order.paymentReference);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${numId}`);
  return NextResponse.json(result);
}
