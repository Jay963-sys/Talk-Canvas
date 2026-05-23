import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/db/queries/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const order = await getOrderById(numId);
  if (!order) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        All orders
      </Link>

      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Order
          </p>
          <h1 className="display text-4xl md:text-5xl font-normal mt-2">
            #{String(order.id).padStart(5, "0")}
          </h1>
          <p className="text-sm text-muted mt-2">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          {/* Items */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
              Items
            </h2>
            <div className="border-t border-line">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-line"
                >
                  <div className="w-[60px] relative aspect-[4/5] bg-line overflow-hidden">
                    {" "}
                    <Image
                      src={item.imageUrl}
                      alt="Order thumbnail"
                      fill // Fills the aspect-[4/5] container
                      sizes="60px" // Tells Next.js to serve the absolute smallest version
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {item.type === "original" ? (
                      <>
                        <p className="display-italic text-lg">{item.title}</p>
                        <p className="text-xs text-muted mt-1">
                          {item.artist} {item.year ? `· ${item.year}` : ""} ·
                          Original
                        </p>
                      </>
                    ) : (
                      <p className="display-italic text-lg">Custom print</p>
                    )}

                    <p className="text-xs text-muted mt-1">
                      {item.frameName} {item.glass ? " · with glass" : ""}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.sizeLabel}
                    </p>

                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent hover:text-accent-dark mt-2 inline-block"
                    >
                      Open original image ↗
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium">
                      {formatNaira(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="bg-paper p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">
                {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
              </span>
              <span>
                {order.shipping === 0 ? "Free" : formatNaira(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-line">
              <span className="text-sm font-medium">Total</span>
              <span className="display text-2xl font-medium">
                {formatNaira(order.total)}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Status updater */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              Status
            </h2>
            <OrderStatusSelect id={order.id} currentStatus={order.status} />
          </section>

          {/* Payment Information */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              Payment
            </h2>
            <div className="flex items-center gap-2">
              {order.paymentStatus === "paid" ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              )}
              <span className="text-sm capitalize">
                {order.paymentStatus || "Unpaid"}
              </span>
            </div>
            {order.paymentReference && (
              <p className="text-xs text-muted mt-2 font-mono break-all">
                Ref: {order.paymentReference}
              </p>
            )}
          </section>

          {/* Customer */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              Customer
            </h2>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm text-ink-soft mt-1">
              <a
                href={`mailto:${order.customerEmail}`}
                className="hover:underline"
              >
                {order.customerEmail}
              </a>
            </p>
            <p className="text-sm text-ink-soft mt-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="hover:underline"
              >
                {order.customerPhone}
              </a>
            </p>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              {order.deliveryMethod === "pickup"
                ? "Pickup"
                : "Shipping address"}
            </h2>
            {order.deliveryMethod === "pickup" ? (
              <p className="text-sm text-ink-soft">
                Customer will collect from the showroom.
              </p>
            ) : (
              <div className="text-sm space-y-1">
                {order.addressLine1 && <p>{order.addressLine1}</p>}
                {order.addressLine2 && <p>{order.addressLine2}</p>}
                <p>
                  {order.city}, {order.state}
                </p>
                {order.postalCode && <p>{order.postalCode}</p>}
                <p>{order.country}</p>
              </div>
            )}
          </section>
          {/* Notes */}
          {order.notes && (
            <section>
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
                Customer notes
              </h2>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {order.notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
