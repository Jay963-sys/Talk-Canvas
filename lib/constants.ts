export const ORDER_STATUSES = [
  "pending",
  "in_production",
  "ready_for_delivery",
  "in_transit",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_production: "In production",
  ready_for_delivery: "Ready for delivery",
  in_transit: "In transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── PAYMENT ─────────────────────────────────────────────────────
// "part_paid" = the customer has paid something, but the order total has since
// grown (a delivery quote was added) or a balance is otherwise outstanding.
export const PAYMENT_STATUSES = ["unpaid", "part_paid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  part_paid: "Part paid",
  paid: "Paid",
};

/** The one place payment status is decided: from what's been paid vs the total. */
export function paymentStatusFor(
  amountPaid: number,
  total: number,
): PaymentStatus {
  if (amountPaid <= 0) return "unpaid";
  return amountPaid >= total ? "paid" : "part_paid";
}

// ── HOUSE ARTIST ────────────────────────────────────────────────
// Works under this artist are the recreatable Talk Canvas Originals (not
// one-of-one); everything under a real artist is a one-of-one piece. Single
// source of truth for the slug/name so the mark-sold logic, admin defaults,
// and backfills all agree.
export const HOUSE_ARTIST_SLUG = "talk-canvas";
export const HOUSE_ARTIST_NAME = "Talk Canvas";
