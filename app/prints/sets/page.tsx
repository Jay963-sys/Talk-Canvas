import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getArchivePage,
  withSetPanels,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Sets — Talk Canvas Gallery",
  description:
    "Diptychs, triptychs and complementary pairs. Each set hangs together in one frame style and size — choose your frame, preview the scale, and order the whole set.",
};

export const dynamic = "force-dynamic";

const ORIENTATIONS: { id: ArchiveOrientation | null; label: string }[] = [
  { id: null, label: "All shapes" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

function setsHref(orientation: ArchiveOrientation | undefined): string {
  return orientation
    ? `/prints/sets?orientation=${orientation}`
    : "/prints/sets";
}

export default async function SetsPage({
  searchParams,
}: {
  searchParams: Promise<{ orientation?: string }>;
}) {
  const { orientation: rawOrientation } = await searchParams;
  const orientation: ArchiveOrientation | undefined =
    rawOrientation === "portrait" || rawOrientation === "landscape"
      ? rawOrientation
      : undefined;

  // No category filter here on purpose. Sets are a format, not a style, and
  // there are far fewer of them — stacking nine style tabs over a short grid
  // would be mostly empty tabs. Shape still matters, since it decides whether
  // a set fits the wall someone has in mind.
  //
  // withSetPanels is what lets each tile show the whole group rather than one
  // panel and a badge: on this page every row is a set, so fetching panels per
  // tile would be a request each.
  const { items, nextCursor } = await withSetPanels(
    await getArchivePage(undefined, undefined, undefined, orientation, true),
  );

  const initialItems: ArchiveItem[] = items.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    imagePublicId: i.imagePublicId,
    width: i.width,
    height: i.height,
    collection: i.collection,
    setId: i.setId,
    setSize: i.setSize,
    panels: i.panels,
  }));

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-12">
          <Link
            href="/prints"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Gallery Walls
          </Link>

          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
            Hang together
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
            Sets
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Some pieces are made to hang as a group — one artwork across several
            panels, or designs that answer each other. Every piece in a set
            takes the same frame and size, and they&apos;re sold together.
          </p>
        </div>

        <div className="border-b border-line mb-12">
          <div className="flex justify-center gap-x-6 py-3">
            {ORIENTATIONS.map((f) => {
              const active = (orientation ?? null) === f.id;
              return (
                <Link
                  key={f.label}
                  href={setsHref(f.id ?? undefined)}
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

        <div className="bg-paper rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto text-center">
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Sets are printed on the same archival paper as every other piece,
            and framed to match across the group. Delivery is arranged
            individually — we&apos;ll quote it after you order.
          </p>
        </div>

        <ArchiveGrid
          key={orientation ?? "all"}
          initialItems={initialItems}
          initialCursor={nextCursor}
          orientation={orientation}
          setsOnly
        />

        <div className="mt-32">
          <Testimonials title="On pieces from the archive" />
        </div>
      </div>
    </div>
  );
}
