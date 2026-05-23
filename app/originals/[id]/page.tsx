import { getAllOriginals, getOriginalBySlug } from "@/lib/db/queries/originals";
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
    title: `${work.title} — ${work.artist}`, // The layout template will append " | Talk Canvas Gallery"
    description: work.description,
    openGraph: {
      title: `${work.title} | ${work.artist}`,
      description: `Original ${work.medium}, ${work.year}.`,
      images: [
        {
          url: work.imageUrl, // Pulls the real Cloudinary image!
          width: 800,
          height: 1000,
          alt: work.title,
        },
      ],
      type: "article", // Better for individual products than "website"
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
  const work = await getOriginalBySlug(id);
  if (!work) notFound();

  return (
    <div className="fade-in max-w-7xl mx-auto px-6 md:px-10 py-12">
      <Link
        href="/originals"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        All originals
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        <div className="relative w-full aspect-[4/5] bg-line overflow-hidden">
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            priority // Tells Next.js to load this immediately, not lazily
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {work.artist} — {work.year}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <h1 className="display-italic text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
              {work.title}
            </h1>
            {work.soldAt && (
              <span className="px-3 py-1 bg-ink text-cream text-xs uppercase tracking-[0.15em]">
                Sold
              </span>
            )}
          </div>

          <div className="mt-10 space-y-3 text-sm text-ink-soft">
            <DetailRow label="Medium" value={work.medium} />
            <DetailRow label="Dimensions" value={originalSizeLabel(work)} />

            {/* Replaced manual calculation with your new helper here! */}
            <DetailRow label="Framing" value={originalFrameLabel(work)} />

            <DetailRow label="Price" value={formatNaira(work.price)} />
          </div>

          <p className="text-[15px] leading-relaxed mt-10 text-ink-soft">
            {work.description}
          </p>

          <div className="mt-auto pt-12 flex gap-3">
            <OriginalActions original={work} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
