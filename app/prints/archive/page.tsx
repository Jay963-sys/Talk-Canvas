import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArchivePage } from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";

export const metadata = {
  title: "Archive — Talk Canvas Gallery",
  description:
    "Browse our archive of prints. Tap any piece to choose a frame and size, preview it on your wall in AR, and add it to your cart.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const { items, nextCursor } = await getArchivePage();

  // Pass only what the grid needs — keeps client props lean and serialisable.
  const initialItems: ArchiveItem[] = items.map(
    (i: {
      id: any;
      imageUrl: any;
      imagePublicId: any;
      width: any;
      height: any;
    }) => ({
      id: i.id,
      imageUrl: i.imageUrl,
      imagePublicId: i.imagePublicId,
      width: i.width,
      height: i.height,
    }),
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
      <Link
        href="/prints"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-12"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to prints
      </Link>

      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          The collection
        </p>
        <h1 className="display text-5xl md:text-6xl font-normal mt-3 leading-[1.05]">
          Browse the <span className="display-italic">archive</span>
        </h1>
        <p className="text-ink-soft mt-6 leading-relaxed max-w-xl">
          Every piece we've printed, in one place. Tap any image to choose a
          frame and size, preview it on your wall, and add it to your cart.
        </p>
      </div>

      <ArchiveGrid initialItems={initialItems} initialCursor={nextCursor} />
    </div>
  );
}
