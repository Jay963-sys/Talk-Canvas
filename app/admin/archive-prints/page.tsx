import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllArchivePrints } from "@/lib/db/queries/archivePrints";
import ArchiveAdminGrid from "@/components/admin/ArchiveAdminGrid";
import type { AdminArchiveItem } from "@/components/admin/ArchiveAdminCard";
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
  searchParams: Promise<{ category?: string; sets?: string }>;
}) {
  const { category: rawCategory, sets: rawSets } = await searchParams;
  const category: ArchiveCategory | undefined = isArchiveCategory(rawCategory)
    ? rawCategory
    : undefined;
  const setsOnly = rawSets === "1";

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

  // Distinct sets, not panels — a triptych is one thing to review, and a tab
  // reading "Sets (36)" when there are twelve of them would be a lie.
  const setCount = new Set(
    all.map((i) => i.setId).filter((id): id is number => id != null),
  ).size;

  // Category and format are independent axes and combine, the same way they do
  // for customers: "the Afrocentric sets" is a real thing to want to look at.
  const filtered = all.filter((item) => {
    if (setsOnly && item.setId == null) return false;
    if (!category) return true;
    const key = isArchiveCategory(item.collection)
      ? item.collection
      : DEFAULT_ARCHIVE_CATEGORY;
    return key === category;
  });

  // Unlike the public feed, admin shows every panel of a set, not just the
  // leading one — staff need to see and manage each piece. ArchiveAdminGrid
  // regroups them into one block per set.
  const items: AdminArchiveItem[] = filtered.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    isVisible: i.isVisible,
    orientation: i.orientation,
    collection: i.collection,
    setId: i.setId,
    setPosition: i.setPosition,
    setSize: i.setSize,
  }));

  const shownSets = new Set(
    filtered.map((i) => i.setId).filter((id): id is number => id != null),
  ).size;

  /** Keep whichever axis isn't being changed. */
  function href(next: { category?: ArchiveCategory | null; sets?: boolean }) {
    const nextCategory =
      next.category === undefined ? category : (next.category ?? undefined);
    const nextSets = next.sets === undefined ? setsOnly : next.sets;
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextSets) params.set("sets", "1");
    const qs = params.toString();
    return qs ? `/admin/archive-prints?${qs}` : "/admin/archive-prints";
  }

  const tab = (active: boolean, empty = false) =>
    `text-[12px] uppercase tracking-widest pb-1 border-b transition-colors ${
      active
        ? "text-ink border-ink font-medium"
        : empty
          ? "text-muted border-transparent hover:text-ink-soft"
          : "text-ink-soft hover:text-ink border-transparent"
    }`;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium">
            {setsOnly ? "Archive sets" : "Archive prints"}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {setsOnly ? (
              <>
                {shownSets} set{shownSets === 1 ? "" : "s"}
                {category ? " in this category" : " in the archive"}
                {items.length > 0 && ` · ${items.length} pieces`}
              </>
            ) : (
              <>
                {items.length} piece{items.length === 1 ? "" : "s"}
                {category ? " in this category" : " in the archive"}
              </>
            )}
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

      {/* Format sits on its own row above style. A set is a shape of listing,
          not a genre — folding it in beside Abstract and Pop would suggest a
          piece is either Afrocentric or part of a set, when it's routinely
          both. */}
      {all.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 pb-3 mb-3">
          <Link href={href({ sets: false })} className={tab(!setsOnly)}>
            All pieces ({all.length})
          </Link>
          <Link
            href={href({ sets: true })}
            className={tab(setsOnly, setCount === 0)}
          >
            Sets ({setCount})
          </Link>
        </div>
      )}

      {/* Filter — the working tool for clearing out "Others" after a bulk
          upload, so counts are shown rather than hidden. */}
      {all.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-3 mb-6">
          <Link href={href({ category: null })} className={tab(!category)}>
            All ({all.length})
          </Link>
          {ARCHIVE_CATEGORIES.map((c) => {
            const count = counts.get(c.slug) ?? 0;
            const active = category === c.slug;
            return (
              <Link
                key={c.slug}
                href={href({ category: c.slug as ArchiveCategory })}
                className={tab(active, count === 0)}
              >
                {c.label} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <div className="border border-line py-20 text-center text-ink-soft">
          {setsOnly && category ? (
            <>
              No sets filed under this category yet.{" "}
              <Link href={href({ category: null })} className="underline">
                Show all sets
              </Link>
              .
            </>
          ) : setsOnly ? (
            <>
              No sets yet — group two or more pieces from{" "}
              <Link href={href({ sets: false })} className="underline">
                the full archive
              </Link>
              .
            </>
          ) : category ? (
            <>
              Nothing filed under this category yet.{" "}
              <Link href={href({ category: null })} className="underline">
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
        // Grouping needs loose pieces to pick from, and this view has none by
        // definition — the action is hidden rather than offered and rejected.
        <ArchiveAdminGrid items={items} allowGrouping={!setsOnly} />
      )}
    </div>
  );
}
