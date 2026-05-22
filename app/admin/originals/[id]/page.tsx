import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OriginalForm from "@/components/admin/OriginalForm";
import { getOriginalById } from "@/lib/db/queries/originals";

export const metadata = { title: "Edit original — Admin" };

export default async function EditOriginalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const original = await getOriginalById(numId);
  if (!original) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to originals
      </Link>

      <p className="text-xs uppercase tracking-[0.15em] text-muted">Edit</p>
      <h1 className="display text-4xl md:text-5xl font-normal mt-2 mb-10">
        {original.title}
      </h1>

      {/* FIXED: Passing the single 'original' prop expected by the component */}
      <OriginalForm original={original} />
    </div>
  );
}
