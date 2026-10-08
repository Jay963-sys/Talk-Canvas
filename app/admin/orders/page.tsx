import Link from "next/link";
import { getOrdersFiltered } from "@/lib/db/queries/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/store";
import { PAYMENT_LABELS, type PaymentStatus } from "@/lib/constants";
import { CheckAllUnpaidButton } from "@/components/admin/CheckPaymentButton";

// Paid orders are what staff work from. Unpaid ones are checkouts that were
// started but not paid (or paid in a way the site missed) — kept, because the
// record is what lets a payment be traced, but out of the way by default.
type View = "paid" | "unpaid" | "all";

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  paid: "text-green-600",
  part_paid: "text-amber-600",
  unpaid: "text-red-500",
};

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

// Parse the ?from / ?to day-strings into an inclusive createdAt range.
// NOTE: bounds use the server clock (UTC on Vercel); Lagos is UTC+1, so an
// order placed just after local midnight can land in the previous day at the
// boundary. Fine for internal reporting; revisit if exact-day precision matters.
function parseRange(sp: { from?: string; to?: string }) {
  const from = sp.from ? new Date(`${sp.from}T00:00:00`) : undefined;
  const to = sp.to ? new Date(`${sp.to}T23:59:59.999`) : undefined;
  return {
    from: from && !Number.isNaN(+from) ? from : undefined,
    to: to && !Number.isNaN(+to) ? to : undefined,
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; view?: string }>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const view: View =
    sp.view === "unpaid" || sp.view === "all" ? sp.view : "paid";
  const allOrders = await getOrdersFiltered(range);
  const isPaidish = (s: string) => s === "paid" || s === "part_paid";
  const counts = {
    paid: allOrders.filter((o) => isPaidish(o.paymentStatus)).length,
    unpaid: allOrders.filter((o) => !isPaidish(o.paymentStatus)).length,
    all: allOrders.length,
  };
  const orders =
    view === "all"
      ? allOrders
      : allOrders.filter(
          (o) => isPaidish(o.paymentStatus) === (view === "paid"),
        );
  const tabHref = (v: View) => {
    const q = new URLSearchParams();
    if (v !== "paid") q.set("view", v);
    if (sp.from) q.set("from", sp.from);
    if (sp.to) q.set("to", sp.to);
    return `/admin/orders${q.toString() ? `?${q}` : ""}`;
  };
  const needingQuote = orders.filter((o) => o.deliveryQuotePending).length;

  const filtered = !!(range.from || range.to);
  // Preserve the active filter on the export link.
  const exportQuery = new URLSearchParams();
  if (sp.from) exportQuery.set("from", sp.from);
  if (sp.to) exportQuery.set("to", sp.to);
  const exportHref = `/api/admin/orders/export${
    exportQuery.toString() ? `?${exportQuery}` : ""
  }`;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Manage
          </p>
          <h1 className="display text-4xl md:text-5xl font-normal mt-2">
            Orders
          </h1>
          <p className="text-sm text-ink-soft mt-2">
            {orders.length}{" "}
            {view === "unpaid" ? "unpaid" : view === "paid" ? "paid" : ""}{" "}
            {orders.length === 1 ? "order" : "orders"}
            {filtered ? " in range" : ""}
          </p>
        </div>

        <a
          href={exportHref}
          className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink text-[11px] uppercase tracking-widest font-medium hover:bg-ink hover:text-cream transition-colors"
        >
          Export CSV
        </a>
      </div>

      {/* Paid / Unpaid / All — paid is the default. */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(
          [
            ["paid", "Paid"],
            ["unpaid", "Unpaid"],
            ["all", "All"],
          ] as const
        ).map(([v, label]) => (
          <Link
            key={v}
            href={tabHref(v)}
            className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors ${
              view === v
                ? "bg-ink text-cream border-ink"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {label} ({counts[v]})
          </Link>
        ))}
      </div>

      {view === "unpaid" && (
        <div className="mb-8 border border-line bg-paper px-5 py-4">
          <p className="text-sm text-ink-soft mb-3 max-w-2xl">
            These checkouts were started but never recorded as paid. Most are
            abandoned. If a customer says they paid, check it with Paystack — it
            confirms the payment and sends their order emails.
          </p>
          <CheckAllUnpaidButton />
        </div>
      )}

      {/* Date-range filter — native GET form, no client JS. */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-4 mb-8 p-5 bg-paper border border-line/60"
      >
        <div>
          <label
            htmlFor="from"
            className="block text-[10px] uppercase tracking-widest text-ink-soft font-semibold mb-2"
          >
            From
          </label>
          <input
            type="date"
            id="from"
            name="from"
            defaultValue={sp.from ?? ""}
            className="px-3 py-2 bg-transparent border border-line focus:border-ink outline-none text-[14px] text-ink"
          />
        </div>
        <div>
          <label
            htmlFor="to"
            className="block text-[10px] uppercase tracking-widest text-ink-soft font-semibold mb-2"
          >
            To
          </label>
          <input
            type="date"
            id="to"
            name="to"
            defaultValue={sp.to ?? ""}
            className="px-3 py-2 bg-transparent border border-line focus:border-ink outline-none text-[14px] text-ink"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-ink text-cream text-[11px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
        >
          Filter
        </button>
        {filtered && (
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

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
          <p className="text-ink-soft">
            {view === "unpaid"
              ? "No unpaid orders."
              : filtered
                ? "No orders in this range."
                : view === "paid"
                  ? "No paid orders yet."
                  : "No orders yet."}
          </p>
          {!filtered && (
            <p className="text-xs text-muted mt-2">
              Orders will appear here as customers place them.
            </p>
          )}
        </div>
      ) : (
        <div className="max-w-[100rem] mx-auto px-6 md:px-10 py-12">
          {" "}
          {/* Added a min-width to ensure columns have enough room to breathe on mobile, triggering the scroll */}
          <table className="w-full min-w-[950px] xl:min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-paper text-[10px] uppercase tracking-widest text-ink-soft">
                <th className="sticky left-0 z-20 bg-paper px-4 py-3 font-semibold whitespace-nowrap border-r border-line md:border-r-0">
                  Order
                </th>
                {/* Removed whitespace-nowrap so headers can dictate dynamic column widths */}
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">
                  Amount
                </th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="group bg-white hover:bg-paper border-t border-line transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-paper transition-colors px-4 py-4 whitespace-nowrap align-top border-r border-line md:border-r-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="display-italic text-base hover:underline"
                    >
                      #{String(order.id).padStart(5, "0")}
                    </Link>
                    {order.deliveryQuotePending && (
                      <span className="block mt-1.5 w-fit px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-widest">
                        Quote needed
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-xs text-muted whitespace-nowrap align-top">
                    {formatDateTime(order.createdAt)}
                  </td>

                  <td className="px-4 py-4 align-top min-w-[180px]">
                    <p className="text-[13px] text-ink">{order.customerName}</p>
                    <p className="text-[11px] text-muted mt-0.5 break-all">
                      {order.customerEmail}
                    </p>
                    <p className="text-[11px] text-muted">
                      {order.customerPhone}
                    </p>
                  </td>

                  <td className="px-4 py-4 align-top">
                    {/* Kept break-all so long ID strings wrap cleanly instead of stretching the column */}
                    <span className="text-[11px] font-mono text-ink-soft break-all">
                      {order.paymentReference ?? "—"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right text-[13px] font-medium whitespace-nowrap align-top">
                    {formatNaira(order.total)}
                  </td>

                  <td className="px-4 py-4 align-top text-[10px] uppercase tracking-wider">
                    {(() => {
                      const key = (
                        order.paymentStatus in PAYMENT_LABELS
                          ? order.paymentStatus
                          : "unpaid"
                      ) as PaymentStatus;
                      return (
                        <>
                          <span className={PAYMENT_COLORS[key]}>
                            {PAYMENT_LABELS[key]}
                          </span>
                          {key === "part_paid" && (
                            <span className="block normal-case tracking-normal text-[11px] text-muted mt-0.5">
                              {formatNaira(order.total - order.amountPaid)} due
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap align-top text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
