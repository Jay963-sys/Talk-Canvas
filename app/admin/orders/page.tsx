import Link from "next/link";
import { getAllOrdersWithItems } from "@/lib/db/queries/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/store";
import Image from "next/image";

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
  const needingQuote = orders.filter((o) => o.deliveryQuotePending).length;

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

      {/* Outside-Lagos orders were charged nothing for delivery — they need a
          fee agreed with the customer before they can be settled. */}
      {needingQuote > 0 && (
        <div className="border-l-2 border-amber-500 bg-amber-50 px-5 py-4 mb-8">
          <p className="text-sm text-amber-900">
            <span className="font-medium">
              {needingQuote} order{needingQuote !== 1 ? "s" : ""} need
              {needingQuote === 1 ? "s" : ""} a delivery quote.
            </span>{" "}
            These are outside Lagos, so no delivery fee was charged. Agree a
            price with the customer and record it on the order.
          </p>
        </div>
      )}

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
            const pieces = order.items.reduce(
              (n, i) => n + (i.quantity ?? 1),
              0,
            );
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-[60px_1fr_140px_auto_auto_auto] gap-6 items-center py-4 border-b border-line hover:bg-paper transition-colors"
              >
                <div className="w-[60px] relative aspect-[4/5] bg-line overflow-hidden">
                  {firstItem && (
                    <Image
                      src={firstItem.imageUrl}
                      alt="Order thumbnail"
                      fill
                      sizes="60px"
                      className="object-cover"
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
                    {pieces} piece{pieces !== 1 ? "s" : ""} ·{" "}
                    {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                    {order.affiliateCode && (
                      <span className="text-accent font-medium">
                        {" "}
                        · {order.affiliateCode}
                      </span>
                    )}
                    {order.notes && (
                      <span className="text-accent font-medium">
                        {" "}
                        · customer left notes
                      </span>
                    )}
                  </p>
                  {order.deliveryQuotePending && (
                    <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase tracking-widest">
                      Delivery quote needed
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted whitespace-nowrap">
                  {formatDateTime(order.createdAt)}
                </div>

                <div className="text-base font-medium whitespace-nowrap">
                  {formatNaira(order.total)}
                </div>

                <div className="text-[10px] uppercase tracking-wider">
                  {order.paymentStatus === "paid" ? (
                    <span className="text-green-600">Paid</span>
                  ) : (
                    <span className="text-red-500">Unpaid</span>
                  )}
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
