import { getAllOriginals, getOriginalBySlug } from "@/lib/db/queries/originals";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EnquireButton from "@/components/originals/EnquireButton";

export const revalidate = 60;

export async function generateStaticParams() {
  const all = await getAllOriginals();
  return all.map((o) => ({ id: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getOriginalBySlug(id);
  if (!work) return {};
  return {
    title: `${work.title} — ${work.artist} | Talk Canvas Gallery`,
    description: work.description,
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
        <div className="bg-line">
          <img src={work.imageUrl} alt={work.title} className="w-full block" />
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {work.artist} — {work.year}
          </p>
          <h1 className="display-italic text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mt-3">
            {work.title}
          </h1>

          <div className="mt-10 space-y-3 text-sm text-ink-soft">
            <DetailRow label="Medium" value={work.medium} />
            <DetailRow label="Dimensions" value={work.size} />
            <DetailRow label="Price" value={work.price} />
          </div>

          <p className="text-[15px] leading-relaxed mt-10 text-ink-soft">
            {work.description}
          </p>

          <div className="mt-auto pt-12 flex gap-3">
            <EnquireButton
              work={{
                id: work.slug,
                title: work.title,
                artist: work.artist,
                price: work.price,
              }}
            />
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
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
