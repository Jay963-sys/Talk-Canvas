import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TestimonialForm from "@/components/admin/TestimonialForm";
import TestimonialDeleteButton from "@/components/admin/TestimonialDeleteButton";
import { getTestimonialById } from "@/lib/db/queries/testimonials";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const testimonial = await getTestimonialById(numId);
  if (!testimonial) notFound();

  return (
    <div>
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to testimonials
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4">
        <h1 className="display text-3xl font-normal">Edit testimonial</h1>
        <TestimonialDeleteButton id={testimonial.id} />
      </div>

      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
