import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OriginalForm from "@/components/admin/OriginalForm";

export const metadata = { title: "New original — Admin" };

export default function NewOriginalPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to originals
      </Link>

      <p className="text-xs uppercase tracking-[0.15em] text-muted">New</p>
      <h1 className="display text-4xl md:text-5xl font-normal mt-2 mb-10">
        Add an original
      </h1>

      <OriginalForm />
    </div>
  );
}
