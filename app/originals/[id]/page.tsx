import {
  getAllOriginals,
  getOriginalBySlug,
  getOriginalBySlugWithArtist,
} from "@/lib/db/queries/originals";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OriginalActions from "@/components/originals/OriginalActions";
import { originalSizeLabel, originalFrameLabel } from "@/lib/originalDisplay";
import { formatNaira } from "@/lib/store";
import Image from "next/image";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const all = await getAllOriginals();
  return all.map((o) => ({ id: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const work = await getOriginalBySlug(id);

  if (!work) return { title: "Artwork Not Found" };

  return {
    title: `${work.title} — ${work.artist}`,
    description: work.description,
    openGraph: {
      title: `${work.title} | ${work.artist}`,
      description: `Original ${work.medium}, ${work.year}.`,
      images: [
        {
          url: work.imageUrl,
          width: 800,
          height: 1000,
          alt: work.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: `Original ${work.medium} by ${work.artist}.`,
      images: [work.imageUrl],
    },
  };
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getOriginalBySlugWithArtist(id);
  if (!work) notFound();

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Minimalist Back Navigation */}
        <Link
          href="/originals"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-10 md:mb-16"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Shop
        </Link>

        {/* Increased gap massively (gap-16 lg:gap-24) to give the layout room to breathe */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
          {/* Image Container */}
          <div className="relative w-full aspect-[4/5] bg-paper overflow-hidden">
            {work.soldAt && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-ink text-cream text-[10px] font-medium uppercase tracking-widest z-10">
                Sold Out
              </span>
            )}
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Product Details - E-commerce Hierarchy */}
          <div className="flex flex-col pt-4 md:pt-10">
            {/* 1. Artist & Year — artist links to their page when linked */}
            <p className="text-[12px] uppercase tracking-[0.15em] text-ink-soft font-medium mb-3">
              {work.artistSlug ? (
                <Link
                  href={`/artists/${work.artistSlug}`}
                  className="hover:text-ink transition-colors"
                >
                  {work.artistName ?? work.artist}
                </Link>
              ) : (
                work.artist
              )}{" "}
              — {work.year}
            </p>

            {/* 2. Title (Removed italics, made standard display font) */}
            <h1 className="display text-4xl md:text-5xl font-normal text-ink leading-tight mb-4">
              {work.title}
            </h1>

            {/* 3. Price (Elevated to sit right beneath the title) */}
            <p className="text-lg md:text-xl font-medium text-ink mb-8">
              {formatNaira(work.price)}
            </p>

            {/* 4. Description */}
            <div className="border-t border-line pt-8 mb-8">
              <p className="text-[14.5px] leading-relaxed text-ink-soft">
                {work.description}
              </p>
            </div>

            {/* 5. Metadata (Clean list, price removed as it is now at the top) */}
            <div className="space-y-4 text-[14px] text-ink-soft mb-12">
              <DetailRow label="Medium" value={work.medium} />
              <DetailRow label="Dimensions" value={originalSizeLabel(work)} />
              <DetailRow label="Framing" value={originalFrameLabel(work)} />
            </div>

            {/* 6. Action Buttons */}
            <div className="mt-auto">
              <OriginalActions original={work} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cleaned up the DetailRow to remove heavy borders and align with standard retail spec lists
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-ink font-medium shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
