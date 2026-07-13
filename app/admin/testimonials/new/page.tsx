import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TestimonialForm from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div>
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to testimonials
      </Link>
      <h1 className="display text-3xl font-normal mb-8">New testimonial</h1>
      <TestimonialForm />
    </div>
  );
}
