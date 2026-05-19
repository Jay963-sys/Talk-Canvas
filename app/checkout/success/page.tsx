import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Order received — Talk Canvas Gallery",
};

export default function SuccessPage() {
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
      <p className="text-base text-ink-soft mt-6 leading-relaxed">
        You'll get a confirmation email shortly. Production typically takes 5–7
        days, with delivery in Lagos within 10 days.
      </p>
      <Link
        href="/"
        className="inline-block mt-10 px-6 py-3 border border-line hover:border-ink hover:bg-ink hover:text-cream text-sm font-medium tracking-wider transition-colors"
      >
        Back to gallery
      </Link>
      <p className="text-xs text-muted mt-10 italic">
        (Prototype — no real payment processed. Paystack integration comes in
        step 8.)
      </p>
    </div>
  );
}
