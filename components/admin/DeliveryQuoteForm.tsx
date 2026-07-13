"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

export default function DeliveryQuoteForm({
  orderId,
  subtotal,
  discountAmount,
}: {
  orderId: number;
  subtotal: number;
  discountAmount: number;
}) {
  const router = useRouter();
  const [fee, setFee] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Number(fee);
  const valid = Number.isFinite(parsed) && parsed >= 0 && fee !== "";
  const newTotal = valid
    ? subtotal - discountAmount + Math.round(parsed)
    : null;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/delivery-quote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: Math.round(parsed) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="border-l-2 border-amber-500 bg-amber-50 px-5 py-4 mb-8">
      <div className="flex items-start gap-3 mb-3">
        <Truck size={18} strokeWidth={1.5} className="text-amber-700 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Delivery quote needed
          </p>
          <p className="text-[13px] text-amber-800 mt-1 leading-relaxed">
            This order is outside Lagos, so nothing was charged for delivery.
            Agree a fee with the customer, then record it here — the order total
            updates to match.
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-amber-900 mb-1">
            Delivery fee (₦)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="18000"
            className="w-40 px-3 py-2 border border-amber-300 bg-white text-ink outline-none focus:border-amber-600"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!valid || saving}
          className="px-5 py-2 bg-amber-700 text-white text-xs uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save quote"}
        </button>
        {newTotal !== null && (
          <span className="text-[13px] text-amber-900 pb-2">
            New total: ₦{newTotal.toLocaleString("en-NG")}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}
