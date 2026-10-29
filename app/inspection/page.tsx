import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InspectionForm from "@/components/inspection/InspectionForm";

export const metadata = {
  title: "Book a space inspection",
  description:
    "Not sure which size suits your wall? We'll visit, measure your space and recommend sizes. Available within Lagos.",
};

export default function InspectionPage() {
  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <Link
            href="/prints"
            prefetch={false}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to prints
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
            Lagos only
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
            Book a Space Inspection
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Not sure what size will work? We&apos;ll visit, measure your space
            and recommend the right sizes before you order. We&apos;ll call you
            to confirm a date and the fee, which depends on your location.
          </p>
        </div>

        <div className="bg-paper p-8 md:p-12 rounded-2xl shadow-sm border border-line/40">
          <InspectionForm />
        </div>
      </div>
    </div>
  );
}
