import { notFound } from "next/navigation";
import {
  getAffiliateByStatsToken,
  getOrdersByAffiliate,
  summarizeAffiliateOrders,
} from "@/lib/db/queries/affiliates";
import { formatNaira } from "@/lib/store";
import type { Metadata } from "next";

// Never cache, never index: this page is gated only by the secrecy of its URL.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your referrals — Talk Canvas Gallery",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PartnerStatsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const affiliate = await getAffiliateByStatsToken(token);
  // A bad token is indistinguishable from a missing page — don't confirm that
  // some other token might exist.
  if (!affiliate) notFound();

  const orders = await getOrdersByAffiliate(affiliate.id);
  const stats = summarizeAffiliateOrders(orders);

  const expired =
    !!affiliate.expiresAt &&
    new Date(affiliate.expiresAt).getTime() < Date.now();
  const live = affiliate.isActive && !expired;

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
          Talk Canvas Gallery
        </p>
        <h1 className="display text-4xl md:text-5xl font-normal leading-tight mb-3">
          Hello, {affiliate.name.split(" ")[0]}.
        </h1>
        <p className="text-[15px] text-ink-soft leading-relaxed mb-12">
          Everything referred with your code, updated in real time.
        </p>

        {/* The code */}
        <div className="border border-line p-6 md:p-8 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
                Your code
              </p>
              <p className="display text-3xl text-ink">{affiliate.code}</p>
            </div>
            <span
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                live ? "bg-ink text-cream" : "border border-line text-ink-soft"
              }`}
            >
              {live ? "Active" : expired ? "Expired" : "Paused"}
            </span>
          </div>
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Customers get{" "}
            <span className="text-ink font-medium">
              {affiliate.discountPercent}% off
            </span>{" "}
            prints and Talk Canvas Originals when they use it.
            {affiliate.expiresAt && (
              <>
                {" "}
                Valid until{" "}
                {new Date(affiliate.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border border-line divide-x divide-line mb-12">
          <Stat label="Orders" value={String(stats.orderCount)} />
          <Stat label="Sales referred" value={formatNaira(stats.grossSales)} />
          <Stat
            label="Saved for customers"
            value={formatNaira(stats.totalDiscount)}
          />
        </div>

        {/* Order list — deliberately no customer names or emails. */}
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Referred orders
        </h2>

        {orders.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="text-sm text-ink-soft">
              No orders yet — share your code to get started.
            </p>
          </div>
        ) : (
          <div className="border border-line divide-y divide-line">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    Order #{String(o.id).padStart(5, "0")}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-ink">
                    {formatNaira(o.subtotal - o.discountAmount)}
                  </p>
                  <p className="text-xs text-muted">
                    −{formatNaira(o.discountAmount)} discount
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-6 leading-relaxed">
          “Sales referred” is what customers actually paid for artwork, after
          your discount and excluding delivery. Commission is settled directly
          with Talk Canvas — reach out if anything looks off.
        </p>

        <p className="text-xs text-muted mt-8 pt-6 border-t border-line leading-relaxed">
          This link is private to you. Anyone with it can see this page, so
          please don’t share it.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 md:p-6">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <p className="display text-2xl md:text-3xl text-ink">{value}</p>
    </div>
  );
}
