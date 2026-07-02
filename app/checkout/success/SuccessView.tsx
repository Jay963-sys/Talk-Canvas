"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cartStore";

export default function SuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const clearCart = useCart((s) => s.clear);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
