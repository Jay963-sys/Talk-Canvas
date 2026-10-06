"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote } from "lucide-react";

/** Staff record a balance the customer has paid (e.g. the delivery fee by transfer). */
export default function RecordPaymentForm({
  orderId,
  balance,
}: {
  orderId: number;
  balance: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(balance));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Math.round(Number(amount));
  const valid = Number.isFinite(parsed) && parsed > 0 && parsed <= balance;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-l-2 border-amber-500 bg-amber-50 px-5 py-4 mb-8">
      <div className="flex items-start gap-3 mb-3">
        <Banknote
          size={18}
          strokeWidth={1.5}
          className="text-amber-700 mt-0.5"
        />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Balance due: ₦{balance.toLocaleString("en-NG")}
          </p>
          <p className="text-[13px] text-amber-800 mt-1 leading-relaxed">
            Once the customer has paid the balance (for example the delivery fee
            by transfer), record it here and the order shows as paid.
          </p>
        </div>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-amber-900 mb-1">
            Amount received (₦)
          </label>
          <input
            type="number"
            min="1"
            max={balance}
            step="500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-40 px-3 py-2 border border-amber-300 bg-white text-ink outline-none focus:border-amber-600"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!valid || saving}
          className="px-5 py-2 bg-amber-700 text-white text-xs uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Record payment"}
        </button>
      </div>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}
