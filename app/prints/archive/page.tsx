import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getArchivePage,
  getArchiveCollections,
} from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Archive — Talk Canvas Gallery",
  description:
    "Browse our archive of prints. Tap any piece to choose a frame and size, preview it on your wall in AR, and add it to your cart.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ collection?: string }>;
}

export default async function ArchivePage({ searchParams }: Props) {
  const { collection } = await searchParams;

  const [{ items, nextCursor }, collections] = await Promise.all([
    getArchivePage(undefined, undefined, collection),
    getArchiveCollections(),
  ]);

  const initialItems: ArchiveItem[] = items.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    imagePublicId: i.imagePublicId,
    width: i.width,
    height: i.height,
    collection: i.collection,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
      <Link
        href="/prints"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-12"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to prints
      </Link>

      <div className="mb-10">
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

      {/* Materials note */}
      <div className="border border-line p-6 md:p-8 mb-12 max-w-2xl">
        <p className="text-[15px] text-ink-soft leading-relaxed">
          Every print in the archive is reproduced on archival-grade paper and
          finished in the frame style and size you choose — the same materials
          and process used for custom uploads.
        </p>
      </div>

      {collections.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10 border-b border-line pb-4">
          <Link
            href="/prints/archive"
            className={`text-sm pb-1 ${
              !collection
                ? "text-ink border-b border-accent"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            All
          </Link>
          {collections.map((c) => (
            <Link
              key={c}
              href={`/prints/archive?collection=${encodeURIComponent(c)}`}
              className={`text-sm pb-1 ${
                collection === c
                  ? "text-ink border-b border-accent"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <ArchiveGrid
        key={collection ?? "all"}
        initialItems={initialItems}
        initialCursor={nextCursor}
        collection={collection}
      />

      <div className="mt-24 -mx-6 md:-mx-10">
        <Testimonials title="On pieces from the archive" />
      </div>
    </div>
  );
}
