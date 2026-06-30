import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Upload,
  Frame as FrameIcon,
  Eye,
  PackageCheck,
} from "lucide-react";
import WorkCard from "@/components/WorkCard";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import RoomGallery from "@/components/prints/RoomGallery";
import RotatingGrid from "@/components/RotatingGrid";
import { getAllOriginals } from "@/lib/db/queries/originals";
import {
  getArchivePage,
  getArchiveCollections,
} from "@/lib/db/queries/archivePrints";
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

function thumb(url: string, width = 500): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "Choose a piece",
    description:
      "Upload your own design or pick one from our archive — no design experience needed.",
  },
  {
    icon: FrameIcon,
    title: "Pick frame & size",
    description:
      "Choose the frame style, colour, and dimensions that fit your space.",
  },
  {
    icon: Eye,
    title: "Preview in AR",
    description:
      "See it on your actual wall, true to scale, before you commit to buy.",
  },
  {
    icon: PackageCheck,
    title: "Framed & delivered",
    description: "Arrives ready to hang — no separate framing required.",
  },
];

export default async function Home() {
  const [all, archivePreview, collections] = await Promise.all([
    getAllOriginals(),
    getArchivePage(undefined, 16),
    getArchiveCollections(),
  ]);

  const featuredPool = all.slice(0, 12);
  const archiveItems = archivePreview.items;

  const collectionTiles = await Promise.all(
    collections.map(async (name) => {
      const page = await getArchivePage(undefined, 1, name);
      return { name, item: page.items[0] ?? null };
    }),
  );

  const artists = Array.from(new Set(all.map((w) => w.artist))).slice(0, 8);

  return (
    <div className="fade-in">
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

      {/* Archive preview */}
      {archiveItems.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-20">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">
                  No design of your own?
                </p>
                <h2 className="display text-3xl md:text-4xl font-normal mt-2">
                  From the <span className="display-italic">archive</span>
                </h2>
              </div>
              <Link
                href="/prints/archive"
                className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink shrink-0"
              >
                View the archive <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
            </div>

            <RotatingGrid
              slotCount={4}
              items={archiveItems.map((item, i) => (
                <Link
                  key={item.imageUrl || i}
                  href="/prints/archive"
                  className="group block overflow-hidden bg-paper"
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(item.imageUrl)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            />
          </section>
        </Reveal>
      )}

      {/* Browse by collection */}
      {collectionTiles.some((c) => c.item) && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
            <h2 className="display text-3xl md:text-4xl font-normal mb-8">
              Browse by <span className="display-italic">collection</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {collectionTiles
                .filter((c) => c.item)
                .map(({ name, item }) => (
                  <Link
                    key={name}
                    href={`/prints/archive?collection=${encodeURIComponent(name)}`}
                    className="group block"
                  >
                    <div
                      className="overflow-hidden bg-paper mb-3"
                      style={{ aspectRatio: "4 / 3" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb(item!.imageUrl, 600)}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-ink group-hover:text-accent transition-colors">
                      {name}
                      <ArrowUpRight size={14} strokeWidth={1.5} />
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* See it in your space */}
      <Reveal>
        <RoomGallery
          eyebrow="From archive to home"
          title={
            <>
              What it looks like once it's{" "}
              <span className="display-italic">actually hung</span>.
            </>
          }
        />
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section className="bg-paper border-y border-line">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              How prints work
            </p>
            <h2 className="display text-3xl md:text-4xl font-normal mb-14 max-w-lg leading-[1.1]">
              From archive to your wall, in four steps.
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.title}
                  className="lg:border-l lg:border-line lg:pl-6 first:lg:border-l-0 first:lg:pl-0"
                >
                  <span className="font-mono text-[11px] text-muted">
                    0{i + 1}
                  </span>
                  <step.icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-accent mt-3 mb-4"
                  />
                  <h3 className="display-italic text-xl mb-2">{step.title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Philosophy pull-quote */}
      <Reveal>
        <section className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
            Why we do this
          </p>
          <p className="display text-2xl md:text-4xl leading-[1.3] md:leading-[1.25]">
            We believe a piece of art should mean something before it matches
            your sofa.{" "}
            <span className="display-italic">
              Every work here is chosen, not generated
            </span>{" "}
            — painted by hand, printed with care, and shown to you exactly as it
            will hang.
          </p>
        </section>
      </Reveal>

      {/* Currently on view */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
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
          <RotatingGrid
            slotCount={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
            items={featuredPool.map((work, i) => (
              <WorkCard key={work.id || i} work={work} />
            ))}
          />
        </section>
      </Reveal>

      {/* Represented artists */}
      {artists.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
              Painters in the collection
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-3">
              {artists.map((name, i) => (
                <span key={name} className="flex items-center">
                  <Link
                    href="/originals"
                    className="display-italic text-2xl md:text-3xl text-ink-soft hover:text-ink transition-colors"
                  >
                    {name}
                  </Link>
                  {i < artists.length - 1 && (
                    <span className="text-line text-2xl md:text-3xl ml-3">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Testimonials */}
      <Reveal>
        <Testimonials title="What collectors are saying" />
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
