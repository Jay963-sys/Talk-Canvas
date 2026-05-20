"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

export default function SuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="fade-in max-w-2xl mx-auto px-6 py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-accent text-cream flex items-center justify-center mx-auto mb-8">
        <Check size={28} strokeWidth={1.5} />
      </div>
      <h1 className="display text-5xl font-normal leading-tight">
        Order received.
        <br />
        <span className="display-italic">Thank you.</span>
      </h1>
      {orderId && (
        <p className="text-xs uppercase tracking-[0.15em] text-muted mt-6 font-mono">
          Order #{String(orderId).padStart(5, "0")}
        </p>
      )}
      <p className="text-base text-ink-soft mt-6 leading-relaxed">
        You'll get a confirmation email shortly. Production typically takes 5–7
        days; we'll be in touch with delivery or pickup details once your print
        is ready.
      </p>
      <Link
        href="/"
        className="inline-block mt-10 px-6 py-3 border border-line hover:border-ink hover:bg-ink hover:text-cream text-sm font-medium tracking-wider transition-colors"
      >
        Back to gallery
      </Link>
    </div>
  );
}
