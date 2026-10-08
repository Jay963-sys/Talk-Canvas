"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

/** Staff ask Paystack whether this order was actually paid. */
export default function CheckPaymentButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const check = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setResult({
        ok: data.state === "confirmed" || data.state === "already_paid",
        message: data.message,
      });
      if (data.state === "confirmed" || data.state === "already_paid")
        router.refresh();
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Check failed",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={check}
        disabled={checking}
        className="inline-flex items-center gap-2 px-4 py-2 border border-ink text-[11px] uppercase tracking-widest hover:bg-ink hover:text-cream transition-colors disabled:opacity-50"
      >
        {checking ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <RefreshCw size={13} />
        )}
        Check payment with Paystack
      </button>
      {result && (
        <p
          className={`text-xs mt-2 ${result.ok ? "text-green-700" : "text-amber-700"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}

/** Checks the most recent unpaid orders in one click (15 at a time). */
export function CheckAllUnpaidButton() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const run = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orders/verify-unpaid", {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Check failed");
      setMessage(
        `Checked ${d.checked}: ${d.confirmed} confirmed as paid, ${d.stillUnpaid} still unpaid` +
          (d.problems ? `, ${d.problems} need a look` : "") +
          (d.more ? ". More are waiting — click again." : "."),
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Check failed");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={checking}
        className="inline-flex items-center gap-2 px-4 py-2 border border-ink text-[11px] uppercase tracking-widest hover:bg-ink hover:text-cream transition-colors disabled:opacity-50"
      >
        {checking ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <RefreshCw size={13} />
        )}
        Check all unpaid with Paystack
      </button>
      {message && <p className="text-xs text-ink-soft mt-2">{message}</p>}
    </div>
  );
}
