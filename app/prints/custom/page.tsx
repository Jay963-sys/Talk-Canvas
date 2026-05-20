import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomOrderForm from "@/components/prints/CustomOrderForm";

export const metadata = {
  title: "Request a custom order — Talk Canvas Gallery",
  description:
    "Custom sizes and special requests. Tell us what you have in mind and a member of our team will be in touch with details and pricing.",
};

export default function CustomOrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
      <Link
        href="/prints"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-12"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to prints
      </Link>

      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          Custom work
        </p>
        <h1 className="display text-5xl md:text-6xl font-normal mt-3 leading-[1.05]">
          Request a <span className="display-italic">custom order</span>
        </h1>
        <p className="text-ink-soft mt-6 leading-relaxed max-w-xl">
          Have something in mind that doesn't fit our standard sizes or styles?
          Tell us what you're imagining and a member of our team will be in
          touch shortly to discuss the details and arrange pricing.
        </p>
      </div>

      <CustomOrderForm />
    </div>
  );
}
