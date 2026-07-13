import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getArchivePage,
  type ArchiveOrientation,
} from "@/lib/db/queries/archivePrints";
import ArchiveGrid, { type ArchiveItem } from "@/components/prints/ArchiveGrid";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Archive — Talk Canvas Gallery",
  description:
    "Browse our archive of prints. Tap any piece to choose a frame and size, preview it on your wall in AR, and add it to your cart.",
};

export const dynamic = "force-dynamic";

const FILTERS: { id: ArchiveOrientation | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ orientation?: string }>;
}) {
  const { orientation: raw } = await searchParams;
  const orientation: ArchiveOrientation | undefined =
    raw === "portrait" || raw === "landscape" ? raw : undefined;

  const { items, nextCursor } = await getArchivePage(
    undefined,
    undefined,
    undefined,
    orientation,
  );

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
            Every piece we&apos;ve printed, in one place. Tap any image to
            choose a frame and size, preview it on your wall, and add it to your
            cart.
          </p>
        </div>

        {/* Orientation filter — derived from each image, nothing to tag. */}
        <div className="flex justify-center gap-x-8 border-b border-line mb-12 pb-3">
          {FILTERS.map((f) => {
            const active = (orientation ?? null) === f.id;
            return (
              <Link
                key={f.label}
                href={
                  f.id
                    ? `/prints/archive?orientation=${f.id}`
                    : "/prints/archive"
                }
                scroll={false}
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

        {/* Materials note - Converted to a clean, centered banner */}
        <div className="bg-paper rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto text-center">
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Every print in the archive is reproduced on archival-grade paper and
            finished in the frame style and size you choose — the same materials
            and process used for custom uploads.
          </p>
        </div>

        {/* The Grid Component */}
        <ArchiveGrid
          key={orientation ?? "all"}
          initialItems={initialItems}
          initialCursor={nextCursor}
          orientation={orientation}
        />

        {/* Testimonials */}
        <div className="mt-32">
          <Testimonials title="On pieces from the archive" />
        </div>
      </div>
    </div>
  );
}
