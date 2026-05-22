import { getAllOriginals } from "@/lib/db/queries/originals";
import Link from "next/link";
import { formatNaira } from "@/lib/store";

export const metadata = {
  title: "Originals — Talk Canvas Gallery",
  description: "Hand-painted works from our represented artists.",
};

// Revalidate at most every 60s so admin edits show up reasonably quickly
export const revalidate = 60;

export default async function OriginalsPage() {
  const works = await getAllOriginals();

  return (
    <div className="fade-in">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          The Gallery
        </p>
        <h1 className="display text-6xl md:text-8xl font-normal leading-none mt-4">
          Originals
        </h1>
        <p className="text-[17px] text-ink-soft max-w-2xl mt-6 leading-relaxed">
          A selection of recent work from our represented artists. Each piece is
          one-of-one. For enquiries about acquisition, pricing, or studio
          visits, please get in touch.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="columns-1 md:columns-3 gap-6">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/originals/${work.slug}`}
              className="block break-inside-avoid mb-8 group"
            >
              <div className="bg-line overflow-hidden">
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full block transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="display-italic text-xl leading-tight">
                    {work.title}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {work.artist}, {work.year}
                  </p>
                </div>
                <p className="text-xs text-ink-soft font-medium whitespace-nowrap pt-1">
                  {formatNaira(work.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
