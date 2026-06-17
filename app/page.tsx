import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import WorkCard from "@/components/WorkCard";
import Reveal from "@/components/Reveal";
import { getAllOriginals } from "@/lib/db/queries/originals";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Talk Canvas Gallery | Contemporary Art in Lagos",
  description:
    "Discover curated contemporary works and custom fine-art prints from emerging African artists.",
  openGraph: {
    title: "Talk Canvas Gallery | Contemporary Art in Lagos",
    description:
      "Discover curated contemporary works and custom fine-art prints from emerging African artists.",
    url: "/",
  },
};

export default async function Home() {
  const all = await getAllOriginals();
  const featured = all.slice(0, 4);

  return (
    <div className="fade-in">
      {/* Fine-print film grain over the whole page */}
      <div className="grain" aria-hidden="true" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-28 pb-12 md:pb-20">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <h1 className="display font-normal leading-[0.95] text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]">
              <span
                className="reveal-up block"
                style={{ animationDelay: "60ms" }}
              >
                A space for
              </span>
              <span
                className="reveal-up block display-italic font-light"
                style={{ animationDelay: "220ms" }}
              >
                quiet looking.
              </span>
            </h1>
          </div>
          <div className="md:col-span-4 md:pl-8">
            <p
              className="reveal-up text-[17px] leading-relaxed text-ink-soft max-w-sm"
              style={{ animationDelay: "380ms" }}
            >
              Talk Canvas Gallery represents painters working across Nigeria and
              the diaspora. We also produce archival prints — from your own
              designs or from our own archive, framed and ready to hang.
            </p>
          </div>
        </div>

        {/* Editorial rule + metadata */}
        <div
          className="reveal-up flex items-center gap-5 mt-12 md:mt-16"
          style={{ animationDelay: "520ms" }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted whitespace-nowrap">
            Lagos, Nigeria
          </span>
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted whitespace-nowrap">
            Painting &amp; archival prints
          </span>
        </div>
      </section>

      {/* Two pillars */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-10 md:pb-14">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <PillarCard
              href="/originals"
              label="01 / Gallery"
              title="Originals"
              description="Hand-painted, one-of-one works from our roster of represented artists. Available for acquisition or enquiry."
              img="/home/4.jpg"
            />
            <PillarCard
              href="/prints"
              label="02 / Editions"
              title="Prints"
              description="Upload your own design, choose a frame and size, and preview it on your wall in AR before you buy."
              img="/home/1.jpg"
              accent
            />
          </div>
        </section>
      </Reveal>

      {/* Archive — the alternative to uploading your own */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
          <Link
            href="/prints/archive"
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-line p-8 md:p-10 hover:border-ink transition-colors"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted">
                No design of your own?
              </p>
              <h3 className="display text-2xl md:text-3xl font-normal mt-2">
                Browse the <span className="display-italic">archive</span>
              </h3>
              <p className="text-[15px] text-ink-soft mt-2 max-w-lg leading-relaxed">
                A growing collection of our own designs, ready to frame. Pick
                one, choose a size, and preview it on your wall.
              </p>
            </div>
            <span className="flex items-center gap-2 text-sm text-ink shrink-0">
              View the archive
              <ArrowUpRight
                size={18}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </Link>
        </section>
      </Reveal>

      {/* Currently on view */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="display text-3xl md:text-4xl lg:text-5xl font-normal">
              Currently on view
            </h2>
            <Link
              href="/originals"
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
            >
              See all works <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function PillarCard({
  href,
  label,
  title,
  description,
  img,
  accent,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  img: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group p-8 flex flex-col min-h-[520px] relative overflow-hidden transition-transform duration-500 hover:-translate-y-1 ${
        accent ? "bg-ink text-cream" : "bg-paper text-ink"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.15em] opacity-60">{label}</p>
      <h3 className="display text-5xl md:text-6xl font-normal mt-3 leading-none">
        {title}
      </h3>
      <div className="flex-1 mt-6 overflow-hidden relative">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] ${
            accent ? "brightness-90 saturate-75" : ""
          }`}
        />
      </div>
      <div className="flex items-end justify-between mt-6">
        <p className="text-[15px] leading-relaxed opacity-85 max-w-xs">
          {description}
        </p>
        <ArrowUpRight size={28} strokeWidth={1.25} className="shrink-0 ml-4" />
      </div>
    </Link>
  );
}
