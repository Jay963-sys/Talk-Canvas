import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AffiliateForm from "@/components/admin/AffiliateForm";
import AffiliateDeleteButton from "@/components/admin/AffiliateDeleteButton";
import {
  getAffiliateById,
  getOrdersByAffiliate,
  summarizeAffiliateOrders,
} from "@/lib/db/queries/affiliates";
import { formatNaira } from "@/lib/store";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EditAffiliatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const affiliate = await getAffiliateById(numId);
  if (!affiliate) notFound();

  const orders = await getOrdersByAffiliate(numId);
  const stats = summarizeAffiliateOrders(orders);

  return (
    <div>
      <Link
        href="/admin/affiliates"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to codes
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="display text-3xl font-normal">{affiliate.code}</h1>
          <p className="text-sm text-ink-soft mt-1">{affiliate.name}</p>
        </div>
        <AffiliateDeleteButton id={affiliate.id} />
      </div>

      {/* Reconciliation summary */}
      <div className="grid grid-cols-3 border border-line divide-x divide-line mb-10">
        <Stat label="Orders" value={String(stats.orderCount)} />
        <Stat label="Customer paid" value={formatNaira(stats.grossSales)} />
        <Stat label="Discount given" value={formatNaira(stats.totalDiscount)} />
      </div>

      {/* The settlement list */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Orders using this code
        </h2>

        {orders.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="text-sm text-ink-soft">
              No orders with this code yet.
            </p>
          </div>
        ) : (
          <div className="border border-line divide-y divide-line">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center gap-4 p-4 hover:bg-paper transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">
                    #{String(o.id).padStart(5, "0")} · {o.customerName}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {o.customerEmail} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-ink">
                    {formatNaira(o.total)}
                  </p>
                  <p className="text-xs text-muted">
                    −{formatNaira(o.discountAmount)} at{" "}
                    {o.discountPercent ?? affiliate.discountPercent}%
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-ink-soft shrink-0 w-24 text-right">
                  {STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                </span>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-3 leading-relaxed">
          Commission is settled with the influencer directly — use “customer
          paid” as the basis for whatever rate you agreed.
        </p>
      </section>

      <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
        Edit code
      </h2>
      <AffiliateForm affiliate={affiliate} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <p className="display text-2xl text-ink">{value}</p>
    </div>
  );
}
