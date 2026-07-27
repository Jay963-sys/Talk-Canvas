import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getArchivePage,
  getArchiveCategoryCounts,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";
import {
  ARCHIVE_CATEGORIES,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";

export const metadata = {
  title: "Archive — Talk Canvas Gallery",
  description:
    "Browse our archive of prints by style — abstract, minimalistic, Afrocentric and more. Tap any piece to choose a frame and size, preview it on your wall in AR, and add it to your cart.",
};

export const dynamic = "force-dynamic";

const ORIENTATIONS: { id: ArchiveOrientation | null; label: string }[] = [
  { id: null, label: "All shapes" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

/**
 * Category and orientation are independent, so every link has to carry the
 * filter it isn't changing. Building both params from the current state keeps
 * "Abstract + Landscape" reachable and shareable as a URL.
 */
function archiveHref(
  category: ArchiveCategory | undefined,
  orientation: ArchiveOrientation | undefined,
): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (orientation) params.set("orientation", orientation);
  const qs = params.toString();
  return qs ? `/prints/archive?${qs}` : "/prints/archive";
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; orientation?: string }>;
}) {
  const { category: rawCategory, orientation: rawOrientation } =
    await searchParams;

  const category: ArchiveCategory | undefined = isArchiveCategory(rawCategory)
    ? rawCategory
    : undefined;

  const orientation: ArchiveOrientation | undefined =
    rawOrientation === "portrait" || rawOrientation === "landscape"
      ? rawOrientation
      : undefined;

  const [{ items, nextCursor }, counts] = await Promise.all([
    getArchivePage(undefined, undefined, category, orientation),
    // Counts respect the active orientation, so "Pop" correctly reads as empty
    // if every Pop design happens to be portrait and Landscape is selected.
    getArchiveCategoryCounts(orientation),
  ]);

  const initialItems: ArchiveItem[] = items.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    imagePublicId: i.imagePublicId,
    width: i.width,
    height: i.height,
    collection: i.collection,
  }));

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <Link
            href="/prints"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Gallery Walls
          </Link>

          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
            The Collection
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
            Browse the Archive
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Every piece we&apos;ve printed, in one place. Narrow by style and by
            shape, then tap any image to choose a frame and size, preview it on
            your wall, and add it to your cart.
          </p>
        </div>

        {/* ── Filters ──────────────────────────────────────────────
            Two independent axes. Style is tagged by the gallery at upload;
            shape is derived from each image, so nothing needs tagging twice.
            Each row preserves the other's selection. */}
        <div className="border-b border-line mb-12">
          {/* Style */}
          <div className="flex items-baseline justify-center gap-x-3 mb-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted shrink-0 hidden sm:block">
              Style
            </span>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-3">
              {[{ slug: null, label: "All styles" }, ...ARCHIVE_CATEGORIES].map(
                (c) => {
                  const slug = c.slug as ArchiveCategory | null;
                  const active = (category ?? null) === slug;
                  const count = slug ? (counts[slug] ?? 0) : total;
                  const empty = count === 0 && !active;

                  return (
                    <Link
                      key={c.label}
                      href={archiveHref(slug ?? undefined, orientation)}
                      scroll={false}
                      aria-current={active ? "page" : undefined}
                      className={`text-[12px] uppercase tracking-widest pb-0.5 border-b transition-colors ${
                        active
                          ? "text-ink border-ink font-medium"
                          : empty
                            ? "text-muted border-transparent hover:text-ink-soft"
                            : "text-ink-soft hover:text-ink border-transparent"
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                },
              )}
            </div>
          </div>

          {/* Shape */}
          <div className="flex items-baseline justify-center gap-x-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted shrink-0 hidden sm:block">
              Shape
            </span>
            <div className="flex justify-center gap-x-6 py-3">
              {ORIENTATIONS.map((f) => {
                const active = (orientation ?? null) === f.id;
                return (
                  <Link
                    key={f.label}
                    href={archiveHref(category, f.id ?? undefined)}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={`text-[12px] uppercase tracking-widest pb-1 border-b -mb-[13px] transition-colors ${
                      active
                        ? "text-ink border-ink font-medium"
                        : "text-ink-soft hover:text-ink border-transparent"
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Materials note */}
        <div className="bg-paper rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto text-center">
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Every print in the archive is reproduced on archival-grade paper and
            finished in the frame style and size you choose — the same materials
            and process used for custom uploads.
          </p>
        </div>

        {/* The Grid — remount on any filter change so the feed starts clean. */}
        <ArchiveGrid
          key={`${category ?? "all"}-${orientation ?? "all"}`}
          initialItems={initialItems}
          initialCursor={nextCursor}
          category={category}
          orientation={orientation}
        />

        <div className="mt-32">
          <Testimonials title="On pieces from the archive" />
        </div>
      </div>
    </div>
  );
}
