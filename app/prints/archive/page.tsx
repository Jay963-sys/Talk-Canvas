import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArchivePage } from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Archive — Talk Canvas Gallery",
  description:
    "Browse our archive of prints. Tap any piece to choose a frame and size, preview it on your wall in AR, and add it to your cart.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const { items, nextCursor } = await getArchivePage();

  const initialItems: ArchiveItem[] = items.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    imagePublicId: i.imagePublicId,
    width: i.width,
    height: i.height,
    collection: i.collection,
  }));

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Header Section - Centered and Minimalist */}
        <div className="flex flex-col items-center text-center mb-16">
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
            Every piece we've printed, in one place. Tap any image to choose a
            frame and size, preview it on your wall, and add it to your cart.
          </p>
        </div>

        {/* Materials note - Converted to a clean, centered banner */}
        <div className="bg-paper rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto text-center">
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Every print in the archive is reproduced on archival-grade paper and
            finished in the frame style and size you choose — the same materials
            and process used for custom uploads.
          </p>
        </div>

        {/* The Grid Component */}
        <ArchiveGrid initialItems={initialItems} initialCursor={nextCursor} />

        {/* Testimonials */}
        <div className="mt-32">
          <Testimonials title="On pieces from the archive" />
        </div>
      </div>
    </div>
  );
}
