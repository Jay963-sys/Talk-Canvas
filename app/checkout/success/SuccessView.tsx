"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart, cartSubtotal } from "@/lib/cartStore";
import { purchase, type ContentItem } from "@/lib/meta/pixel";

export default function SuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  // Paystack appends both to the callback URL; either works as the shared id.
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);

  // Guard against double-fire (StrictMode / re-render) — the event must be
  // sent once, with the same id the server (CAPI) uses.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Fire the browser Purchase BEFORE clearing, while the cart still holds the
    // purchased lines. eventID = Paystack reference → de-duped with the webhook.
    if (reference && items.length > 0) {
      const contents: ContentItem[] = items.map((i) => ({
        id: i.type === "original" ? `original_${i.originalId}` : "print",
        quantity: i.quantity,
        item_price: i.price,
      }));
      purchase({
        paymentReference: reference,
        contents,
        value: cartSubtotal(items),
      });
    }

    clearCart();
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fade-in bg-cream min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* High-contrast success badge */}
      <div className="w-16 h-16 rounded-full bg-ink text-cream flex items-center justify-center mx-auto mb-8 shadow-sm">
        <Check size={28} strokeWidth={1.5} />
      </div>

      {/* Clean, authoritative header */}
      <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-ink mb-4">
        Order Confirmed
      </h1>

      {orderId && (
        <p className="text-[12px] uppercase tracking-widest text-ink font-medium mb-6">
          Order #{String(orderId).padStart(5, "0")}
        </p>
      )}

      <p className="text-[15px] text-ink-soft leading-relaxed max-w-md mx-auto mb-10">
        Thank you for your purchase. You will receive a confirmation email
        shortly. Production typically takes 5–7 days, and we will notify you
        once your piece is ready.
      </p>

      {/* Primary retail action button */}
      <Link
        href="/"
        className="inline-block px-8 py-4 bg-ink hover:bg-ink-soft text-cream text-[12px] uppercase tracking-widest font-medium transition-colors"
      >
        Return to Gallery
      </Link>
    </div>
  );
}
