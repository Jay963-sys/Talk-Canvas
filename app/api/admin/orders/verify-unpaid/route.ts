import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getUnpaidOrdersWithReference } from "@/lib/db/queries/orders";
import { checkPaystackPayment } from "@/lib/orders/verifyPayment";

// A batch per click keeps each request well inside the function time limit.
const BATCH = 15;

/** Staff check the most recent unpaid orders against Paystack in one go. */
export async function POST() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unpaid = await getUnpaidOrdersWithReference(BATCH + 1);
  const batch = unpaid.slice(0, BATCH);

  let confirmed = 0;
  let stillUnpaid = 0;
  let problems = 0;
  for (const order of batch) {
    const r = await checkPaystackPayment(order.paymentReference!);
    if (r.state === "confirmed") confirmed++;
    else if (r.state === "not_paid") stillUnpaid++;
    else if (r.state !== "already_paid") problems++;
  }

  revalidatePath("/admin/orders");
  return NextResponse.json({
    checked: batch.length,
    confirmed,
    stillUnpaid,
    problems,
    // More waiting? Click again — confirmed orders drop out of the unpaid list.
    more: unpaid.length > BATCH,
  });
}
