import { verifyTransaction } from "@/lib/paystack";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { logPaymentEvent } from "@/lib/db/queries/orders";

export type PaymentCheck = {
  reference: string;
  state:
    | "confirmed"
    | "already_paid"
    | "not_paid"
    | "mismatch"
    | "not_found"
    | "error";
  message: string;
};

export async function checkPaystackPayment(
  reference: string,
): Promise<PaymentCheck> {
  try {
    const tx = await verifyTransaction(reference);

    if (tx.status !== "success") {
      await logPaymentEvent({
        source: "admin",
        event: "verify",
        reference,
        outcome: "not_paid",
      });
      return {
        reference,
        state: "not_paid",
        message: `Paystack shows this as "${tx.status}" — no money received yet.`,
      };
    }

    const outcome = String(await fulfillPaidOrder(reference, tx.amount));
    await logPaymentEvent({
      source: "admin",
      event: "verify",
      reference,
      amount: tx.amount / 100,
      outcome,
    });

    switch (outcome) {
      case "fulfilled":
        return {
          reference,
          state: "confirmed",
          message:
            "Payment confirmed. The order is now paid and the emails were sent.",
        };
      case "skipped":
        return {
          reference,
          state: "already_paid",
          message: "Already recorded as paid.",
        };
      case "amount_mismatch":
        return {
          reference,
          state: "mismatch",
          message:
            "Paystack took a different amount from the order total. Check the transaction in Paystack.",
        };
      case "not_found":
        return {
          reference,
          state: "not_found",
          message: "No order matches this reference.",
        };
      default:
        return {
          reference,
          state: "error",
          message: `Unexpected result: ${outcome}`,
        };
    }
  } catch (err) {
    console.error("checkPaystackPayment failed", err);
    await logPaymentEvent({
      source: "admin",
      event: "verify",
      reference,
      outcome: "error",
    });
    return {
      reference,
      state: "error",
      message: "Couldn't reach Paystack. Try again in a moment.",
    };
  }
}
