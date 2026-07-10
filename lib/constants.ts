export const ORDER_STATUSES = [
  "pending",
  "in_production",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_production: "In production",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── HOUSE ARTIST ────────────────────────────────────────────────
// Works under this artist are the recreatable Talk Canvas Originals (not
// one-of-one); everything under a real artist is a one-of-one piece. Single
// source of truth for the slug/name so the mark-sold logic, admin defaults,
// and backfills all agree.
export const HOUSE_ARTIST_SLUG = "talk-canvas";
export const HOUSE_ARTIST_NAME = "Talk Canvas";
