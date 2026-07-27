import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllArchivePrints } from "@/lib/db/queries/archivePrints";
import ArchiveAdminCard from "@/components/admin/ArchiveAdminCard";
import {
  ARCHIVE_CATEGORIES,
  DEFAULT_ARCHIVE_CATEGORY,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category: ArchiveCategory | undefined = isArchiveCategory(rawCategory)
    ? rawCategory
    : undefined;

  const all = await getAllArchivePrints();

  // Counted and filtered in memory rather than per-category queries: the admin
  // grid already loads every row, so this costs nothing extra and keeps the
  // counts and the list guaranteed consistent with each other.
  const counts = new Map<string, number>();
  for (const item of all) {
    const key = isArchiveCategory(item.collection)
      ? item.collection
      : DEFAULT_ARCHIVE_CATEGORY;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const items = category
    ? all.filter((item) => {
        const key = isArchiveCategory(item.collection)
          ? item.collection
          : DEFAULT_ARCHIVE_CATEGORY;
        return key === category;
      })
    : all;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium">Archive prints</h1>
          <p className="text-sm text-ink-soft mt-1">
            {items.length} piece{items.length === 1 ? "" : "s"}
            {category ? " in this category" : " in the archive"}
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

      {/* Filter — the working tool for clearing out "Others" after a bulk
          upload, so counts are shown rather than hidden. */}
      {all.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-3 mb-8">
          <Link
            href="/admin/archive-prints"
            className={`text-[12px] uppercase tracking-widest pb-1 border-b transition-colors ${
              !category
                ? "text-ink border-ink font-medium"
                : "text-ink-soft hover:text-ink border-transparent"
            }`}
          >
            All ({all.length})
          </Link>
          {ARCHIVE_CATEGORIES.map((c) => {
            const count = counts.get(c.slug) ?? 0;
            const active = category === c.slug;
            return (
              <Link
                key={c.slug}
                href={`/admin/archive-prints?category=${c.slug}`}
                className={`text-[12px] uppercase tracking-widest pb-1 border-b transition-colors ${
                  active
                    ? "text-ink border-ink font-medium"
                    : count === 0
                      ? "text-muted border-transparent hover:text-ink-soft"
                      : "text-ink-soft hover:text-ink border-transparent"
                }`}
              >
                {c.label} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <div className="border border-line py-20 text-center text-ink-soft">
          {category ? (
            <>
              Nothing filed under this category yet.{" "}
              <Link href="/admin/archive-prints" className="underline">
                Show all
              </Link>
              .
            </>
          ) : (
            <>
              No archive prints yet.{" "}
              <Link href="/admin/archive-prints/new" className="underline">
                Add some
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        // Masonry, not a fixed grid: cards now render at each design's true
        // aspect ratio, so a rigid grid would either crop them again or leave
        // ragged gaps between rows.
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid mb-4">
              <ArchiveAdminCard
                item={{
                  id: item.id,
                  imageUrl: item.imageUrl,
                  isVisible: item.isVisible,
                  orientation: item.orientation,
                  collection: item.collection,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
