import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArchiveUploader from "@/components/admin/ArchiveUploader";

export default function NewArchivePrintsPage() {
  return (
    // Added padding, width-full, and mx-auto here
    <div className="w-full max-w-3xl mx-auto px-6 py-8">
      <Link
        href="/admin/archive-prints"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to archive
      </Link>

      <h1 className="text-2xl font-medium mb-2">Add archive prints</h1>
      <p className="text-sm text-ink-soft mb-8 max-w-xl">
        Pick a category, then drop in one image or many — upload one category at a time.
      </p>

      <ArchiveUploader />
    </div>
  );
}
