import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // raw body required for signature check
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await fulfillPaidOrder(event.data.reference, event.data.amount ?? 0);
    } catch (err) {
      console.error("Webhook fulfillment error:", err);
      // 500 → Paystack retries; fulfillment is idempotent so retries are safe
      return NextResponse.json(
        { error: "fulfillment failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
