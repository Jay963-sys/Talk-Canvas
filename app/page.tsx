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

  return (
    <div className="fade-in bg-cream">
      
      {/* Promotional Top Banner */}
      <div className="w-full bg-ink text-cream py-2.5 px-4 text-center">
        <p className="text-[10px] uppercase tracking-widest font-medium">
          Shipping across the UK & Nigeria →
        </p>
      </div>

      {/* Full-Bleed E-commerce Hero */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Placeholder image path - update this to your best wide lifestyle shot */}
        <Image
          src="/home/hero-lifestyle.jpg"
          alt="Curated Gallery Wall"
          fill
          priority
          className="object-cover brightness-[0.65]" 
        />
        <div className="relative z-10 flex flex-col items-center mt-12">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-cream/90 mb-4 reveal-up">
            The Canvas Collection
          </p>
          <h1 className="display text-5xl md:text-7xl lg:text-8xl text-cream leading-tight mb-6 reveal-up" style={{ animationDelay: "100ms" }}>
            Refresh your walls.
          </h1>
          <p className="text-[15px] text-cream/90 max-w-md mx-auto mb-10 leading-relaxed reveal-up" style={{ animationDelay: "200ms" }}>
            Curated contemporary originals and custom archival prints, framed and ready to hang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto reveal-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="/originals"
              className="w-full sm:w-auto px-10 py-4 bg-cream text-ink text-[12px] uppercase tracking-widest font-medium hover:bg-white transition-colors"
            >
              Shop Originals
            </Link>
            <Link
              href="/prints"
              className="w-full sm:w-auto px-10 py-4 border border-cream text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-cream/10 transition-colors"
            >
              Gallery Walls
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy - Moved below the fold */}
      <Reveal>
        <section className="max-w-4xl mx-auto px-6 md:px-10 py-24 md:py-32 text-center">
          <h2 className="display text-4xl md:text-5xl font-normal leading-tight mb-6">
            A space for quiet looking.
          </h2>
          <p className="text-[15px] text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Talk Canvas Gallery represents painters working across Nigeria and the
            diaspora. We also produce archival prints — from your own designs or
            from our own archive, framed and ready to hang.
          </p>
        </section>
      </Reveal>

      {/* Two pillars - E-commerce Category Grid */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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

      {/* Currently on view */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="display text-3xl md:text-4xl font-normal mb-4">
              Currently on view
            </h2>
            <Link
              href="/originals"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-ink-soft hover:text-ink pb-1 transition-colors font-medium"
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

      {/* Archive preview */}
      {archiveItems.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="display text-3xl md:text-4xl font-normal mb-4">
                From the archive
              </h2>
              <Link
                href="/prints/archive"
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-ink-soft hover:text-ink pb-1 transition-colors font-medium"
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
                  style={{ aspectRatio: `4/5` }}
                >
                  <img
                    src={thumb(item.imageUrl)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            />
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

      {/* How it works */}
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

      {/* Testimonials */}
      <Reveal>
        <Testimonials title="What collectors are saying" />
      </Reveal>
    </div>
  );
}

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
    <Link href={href} className="group flex flex-col items-center text-center bg-paper rounded-2xl overflow-hidden border border-line/40 transition-colors hover:border-ink/20 pb-10">
      <div className="relative w-full aspect-[4/5] overflow-hidden mb-8 bg-line/20">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="display text-3xl md:text-4xl font-normal mb-3 text-ink">{title}</h3>
      <p className="text-[14px] text-ink-soft leading-relaxed max-w-sm px-6">
        {description}
      </p>
    </Link>
  );
}

