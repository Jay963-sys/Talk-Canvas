import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { logPaymentEvent } from "@/lib/db/queries/orders";

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

  const reference = event.data?.reference;
  const amountKobo = event.data?.amount ?? 0;

  if (event.event === "charge.success" && reference) {
    try {
      const outcome = await fulfillPaidOrder(reference, amountKobo);
      // Keep a record of what Paystack told us and what we did with it — the
      // only way to answer "did the webhook ever arrive?" after the fact.
      await logPaymentEvent({
        source: "webhook",
        event: event.event,
        reference,
        amount: amountKobo / 100,
        outcome: String(outcome),
      });
    } catch (err) {
      console.error("Webhook fulfillment error:", err);
      await logPaymentEvent({
        source: "webhook",
        event: event.event,
        reference,
        amount: amountKobo / 100,
        outcome: "error",
      });
      // 500 → Paystack retries; fulfillment is idempotent so retries are safe
      return NextResponse.json(
        { error: "fulfillment failed" },
        { status: 500 },
      );
    }
  } else if (event.event) {
    await logPaymentEvent({
      source: "webhook",
      event: event.event,
      reference,
      outcome: "ignored",
    });
  }

  return NextResponse.json({ received: true });
}
