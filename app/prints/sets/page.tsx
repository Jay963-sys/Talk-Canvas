import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArchivePage, withSetPanels } from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Sets — Talk Canvas Gallery",
  description:
    "Diptychs, triptychs and complementary pairs. Each set hangs together in one frame style and size — choose your frame, preview the scale, and order the whole set.",
};

export const revalidate = 86400;

export default async function SetsPage() {
  const { items, nextCursor } = await withSetPanels(
    await getArchivePage(undefined, undefined, undefined, undefined, true),
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

        <Suspense fallback={null}>
          <ArchiveGrid
            initialItems={initialItems}
            initialCursor={nextCursor}
            setsOnly
            materialsNote="Sets are printed on the same archival paper as every other piece, and framed to match across the group."
          />
        </Suspense>

        <div className="mt-32">
          <Testimonials title="On pieces from the archive" />
        </div>
      </div>
    </div>
  );
}
