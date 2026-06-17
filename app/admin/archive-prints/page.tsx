import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllArchivePrints } from "@/lib/db/queries/archivePrints";
import ArchiveAdminCard from "@/components/admin/ArchiveAdminCard";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const items = await getAllArchivePrints();

  return (
    // Added container bounds and padding here
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium">Archive prints</h1>
          <p className="text-sm text-ink-soft mt-1">
            {items.length} piece{items.length === 1 ? "" : "s"} in the archive
          </p>
        </div>
        <Link
          href="/admin/archive-prints/new"
          className="inline-flex items-center gap-2 bg-ink text-cream px-4 py-2 text-sm hover:bg-accent transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={1.5} />
          Add prints
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-line py-20 text-center text-ink-soft">
          No archive prints yet.{" "}
          <Link href="/admin/archive-prints/new" className="underline">
            Add some
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <ArchiveAdminCard
              key={item.id}
              item={{
                id: item.id,
                imageUrl: item.imageUrl,
                isVisible: item.isVisible,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
