import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAffiliates } from "@/lib/db/queries/affiliates";
import { formatNaira } from "@/lib/store";

export const dynamic = "force-dynamic";

function isExpired(d: Date | null): boolean {
  return !!d && new Date(d).getTime() < Date.now();
}

export default async function AdminAffiliatesPage() {
  const affiliates = await getAllAffiliates();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="display text-3xl font-normal">Affiliate codes</h1>
          <p className="text-sm text-ink-soft mt-1">
            Discounts apply to prints and Talk Canvas Originals only.
          </p>
        </div>
        <Link
          href="/admin/affiliates/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-cream text-xs uppercase tracking-[0.15em] hover:bg-ink-soft transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          New code
        </Link>
      </div>

      {affiliates.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="text-sm text-ink-soft">
            No affiliate codes yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="border border-line divide-y divide-line">
          {affiliates.map((a) => {
            const expired = isExpired(a.expiresAt);
            return (
              <Link
                key={a.id}
                href={`/admin/affiliates/${a.id}`}
                className="flex items-center gap-4 p-4 hover:bg-paper transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">
                    {a.code}
                    <span className="text-ink-soft font-normal">
                      {" "}
                      · {a.discountPercent}% off
                    </span>
                  </p>
                  <p className="text-xs text-muted truncate">
                    {a.name}
                    {a.expiresAt
                      ? ` · expires ${new Date(a.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : " · no expiry"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.kind === "promo" && (
                    <span className="px-2 py-1 border border-line text-ink-soft text-[10px] uppercase tracking-widest">
                      Promo
                    </span>
                  )}
                  {!a.isActive && (
                    <span className="px-2 py-1 border border-line text-ink-soft text-[10px] uppercase tracking-widest">
                      Inactive
                    </span>
                  )}
                  {expired && (
                    <span className="px-2 py-1 border border-amber-300 text-amber-700 text-[10px] uppercase tracking-widest">
                      Expired
                    </span>
                  )}
                  {a.isActive && !expired && (
                    <span className="px-2 py-1 bg-ink text-cream text-[10px] uppercase tracking-widest">
                      Live
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
