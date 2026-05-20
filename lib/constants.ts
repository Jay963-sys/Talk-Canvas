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
