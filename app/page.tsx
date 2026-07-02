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
    <div className="fade-in bg-cream">
      {/* Hero - Centered and Minimalist */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16 md:pb-24 text-center">
        <h1 className="display font-normal leading-tight text-5xl sm:text-6xl md:text-7xl mb-6">
          <span className="reveal-up block" style={{ animationDelay: "60ms" }}>
            A space for quiet looking.
          </span>
        </h1>
        <p
          className="reveal-up text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed"
          style={{ animationDelay: "220ms" }}
        >
          Talk Canvas Gallery represents painters working across Nigeria and the
          diaspora. We also produce archival prints — from your own designs or
          from our own archive, framed and ready to hang.
        </p>
      </section>

      {/* Two pillars - Softened into clean category cards */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <PillarCard
              href="/originals"
              title="Originals"
              description="Hand-painted, one-of-one works from our roster of represented artists."
              img="/home/4.jpg"
            />
            <PillarCard
              href="/prints"
              title="Editions"
              description="Upload your own design, choose a frame and size, and preview it in AR."
              img="/home/1.jpg"
            />
          </div>
        </section>
      </Reveal>

      {/* Archive preview */}
      {archiveItems.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="display text-3xl md:text-4xl font-normal mb-4">
                From the archive
              </h2>
              <Link
                href="/prints/archive"
                className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink pb-1 border-b border-ink/20 hover:border-ink transition-colors"
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
                  className="group block overflow-hidden bg-paper rounded-xl"
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
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32 bg-paper py-20 rounded-3xl">
            <h2 className="display text-3xl md:text-4xl font-normal mb-10 text-center">
              Browse by collection
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {collectionTiles
                .filter((c) => c.item)
                .map(({ name, item }) => (
                  <Link
                    key={name}
                    href={`/prints/archive?collection=${encodeURIComponent(name)}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <div
                      className="overflow-hidden bg-cream w-full rounded-2xl mb-4"
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb(item!.imageUrl, 600)}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </div>
                    <span className="text-sm font-medium text-ink group-hover:text-ink-soft transition-colors">
                      {name}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* See it in your space */}
      <Reveal>
        <div className="py-10">
          <RoomGallery
            eyebrow="From archive to home"
            title="What it looks like once it's actually hung."
          />
        </div>
      </Reveal>

      {/* How it works - Centered and borderless */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="display text-3xl md:text-4xl font-normal mb-4">
              From archive to your wall.
            </h2>
            <p className="text-ink-soft">
              Four simple steps to elevate your space.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mb-6">
                  <step.icon size={20} strokeWidth={1.5} className="text-ink" />
                </div>
                <h3 className="display text-xl mb-3">{step.title}</h3>
                <p className="text-[14px] text-ink-soft leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Philosophy pull-quote */}
      <Reveal>
        <section className="bg-ink text-cream py-24 md:py-32 text-center px-6 md:px-10 rounded-t-3xl">
          <div className="max-w-4xl mx-auto">
            <p className="display text-2xl md:text-4xl leading-[1.4] md:leading-[1.3] font-light">
              We believe a piece of art should mean something before it matches
              your sofa. Every work here is chosen, not generated — painted by
              hand, printed with care, and shown to you exactly as it will hang.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Currently on view */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="display text-3xl md:text-4xl lg:text-5xl font-normal mb-4">
              Currently on view
            </h2>
            <Link
              href="/originals"
              className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink pb-1 border-b border-ink/20 hover:border-ink transition-colors"
            >
              Shop all works <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
          <RotatingGrid
            slotCount={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            items={featuredPool.map((work, i) => (
              <WorkCard key={work.id || i} work={work} />
            ))}
          />
        </section>
      </Reveal>

      {/* Testimonials */}
      <Reveal>
        <Testimonials title="What collectors are saying" />
      </Reveal>
    </div>
  );
}

// Rewritten PillarCard to float freely without heavy background colors
function PillarCard({
  href,
  title,
  description,
  img,
}: {
  href: string;
  title: string;
  description: string;
  img: string;
}) {
  return (
    <Link href={href} className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-paper">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="display text-3xl md:text-4xl font-normal mb-3">{title}</h3>
      <p className="text-[15px] text-ink-soft leading-relaxed max-w-sm">
        {description}
      </p>
    </Link>
  );
}
