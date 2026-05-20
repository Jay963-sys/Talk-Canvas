import Link from "next/link";
import { getAllOrdersWithItems } from "@/lib/db/queries/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/store";

function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrdersPage() {
  const orders = await getAllOrdersWithItems();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">Manage</p>
        <h1 className="display text-4xl md:text-5xl font-normal mt-2">
          Orders
        </h1>
        <p className="text-sm text-ink-soft mt-2">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-line">
          <p className="text-ink-soft">No orders yet.</p>
          <p className="text-xs text-muted mt-2">
            Orders will appear here as customers place them.
          </p>
        </div>
      ) : (
        <div className="border-t border-line">
          {orders.map((order) => {
            const firstItem = order.items[0];
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-[60px_1fr_140px_auto_auto] gap-6 items-center py-4 border-b border-line hover:bg-paper transition-colors"
              >
                <div className="w-15 aspect-[4/5] bg-line overflow-hidden">
                  {firstItem && (
                    <img
                      src={firstItem.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="display-italic text-lg leading-tight">
                    Order #{String(order.id).padStart(5, "0")}
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">
                    {order.customerName} · {order.customerEmail}
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""} ·{" "}
                    {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                    {order.notes && (
                      <span className="text-accent font-medium">
                        {" "}
                        · customer left notes
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-xs text-muted whitespace-nowrap">
                  {formatDateTime(order.createdAt)}
                </div>
                <div className="text-base font-medium whitespace-nowrap">
                  {formatNaira(order.total)}
                </div>
                <div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
