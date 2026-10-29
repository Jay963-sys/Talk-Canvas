import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomOrderForm from "@/components/prints/CustomOrderForm";
import CustomSizeQuote from "@/components/prints/CustomSizeQuote";

export const metadata = {
  title: "Request a custom order — Talk Canvas Gallery",
  description:
    "Custom sizes and special requests. Tell us what you have in mind and a member of our team will be in touch with details and pricing.",
};

export default function CustomOrderPage() {
  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Header Section - Centered and Minimalist */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <Link
            href="/prints"
            prefetch={false}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Gallery Walls
          </Link>

          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
            Custom Work
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
            Request a Custom Order
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Have something in mind that doesn't fit our standard sizes or
            styles? Tell us what you're imagining and a member of our team will
            be in touch shortly to discuss the details and arrange pricing.
          </p>
        </div>

        {/* Instant pricing for sizes not on the list */}
        <div className="bg-paper p-8 md:p-12 rounded-2xl shadow-sm border border-line/40 mb-10">
          <CustomSizeQuote />
        </div>

        <p className="text-center text-[14px] text-ink-soft mb-10">
          In Lagos and not sure what size suits your wall?{" "}
          <Link
            href="/inspection"
            prefetch={false}
            className="text-ink underline underline-offset-4"
          >
            Book a space inspection
          </Link>
          .
        </p>

        <p className="text-center text-[13px] uppercase tracking-widest text-ink-soft mb-6">
          Something else in mind? Send us a request
        </p>

        {/* Form Container - Wrapped in a soft paper card for contrast */}
        <div className="bg-paper p-8 md:p-12 rounded-2xl shadow-sm border border-line/40">
          <CustomOrderForm />
        </div>
      </div>
    </div>
  );
}
