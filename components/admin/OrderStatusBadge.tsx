import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-paper text-ink-soft border-line",
  in_production: "bg-accent/10 text-accent border-accent/40",
  completed: "bg-green-50 text-green-700 border-green-300",
  cancelled: "bg-red-50 text-red-700 border-red-300",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const key =
    (status as OrderStatus) in STATUS_STYLES
      ? (status as OrderStatus)
      : "pending";
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] uppercase tracking-wider border ${STATUS_STYLES[key]}`}
    >
      {STATUS_LABELS[key]}
    </span>
  );
}
