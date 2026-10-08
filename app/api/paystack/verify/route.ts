import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { getOrderByReference, logPaymentEvent } from "@/lib/db/queries/orders";

export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const reference =
    req.nextUrl.searchParams.get("reference") ||
    req.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/checkout?payment=missing_ref`);
  }

  try {
    const tx = await verifyTransaction(reference);
    if (tx.status === "success") {
      const outcome = await fulfillPaidOrder(reference, tx.amount);
      await logPaymentEvent({
        source: "return",
        event: "callback",
        reference,
        amount: tx.amount / 100,
        outcome: String(outcome),
      });
      const order = await getOrderByReference(reference);
      // reference is forwarded so SuccessView can fire the browser Purchase with
      // the same event id the CAPI Purchase used — that's what de-dupes them.
      return NextResponse.redirect(
        `${siteUrl}/checkout/success?id=${order?.id ?? ""}&reference=${encodeURIComponent(reference)}`,
      );
    }
    await logPaymentEvent({
      source: "return",
      event: "callback",
      reference,
      outcome: "not_paid",
    });
    return NextResponse.redirect(`${siteUrl}/checkout?payment=failed`);
  } catch (err) {
    console.error("Paystack verify error:", err);
    await logPaymentEvent({
      source: "return",
      event: "callback",
      reference,
      outcome: "error",
    });
    return NextResponse.redirect(`${siteUrl}/checkout?payment=error`);
  }
}
