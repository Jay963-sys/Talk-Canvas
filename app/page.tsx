import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import RoomGallery from "@/components/prints/RoomGallery";
import HomeProductGrid from "@/components/HomeProductGrid"; // Imported the new component
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

export default async function Home() {
  const [all, archivePreview, collections] = await Promise.all([
    getAllOriginals(),
    getArchivePage(undefined, 16),
    getArchiveCollections(),
  ]);

  const featuredPool = all.slice(0, 8); 
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
      <div className="w-full bg-ink text-cream py-3 px-4 text-center">
        <p className="text-[10px] uppercase tracking-widest font-medium">
          Shipping across the UK & Nigeria →
        </p>
      </div>

      {/* Full-Bleed E-commerce Hero */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <Image
          src="/1.png"
          alt="Curated Gallery Wall"
          fill
          priority
          className="object-cover brightness-[0.70]" 
        />
        <div className="relative z-10 flex flex-col items-center mt-12 w-full max-w-2xl">
          <p className="text-[11px] uppercase tracking-widest font-bold text-cream/90 mb-4 reveal-up drop-shadow-md">
            The Studio Collection
          </p>
          <h1 className="display text-5xl md:text-7xl lg:text-8xl text-cream leading-tight mb-6 reveal-up drop-shadow-lg" style={{ animationDelay: "100ms" }}>
            Refresh your walls.
          </h1>
          <p className="text-[16px] text-cream/90 max-w-md mx-auto mb-10 leading-relaxed reveal-up drop-shadow-md" style={{ animationDelay: "200ms" }}>
            Discover original paintings or frame a piece from our archive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto reveal-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="/originals"
              className="w-full sm:w-auto px-10 py-4 bg-cream text-ink text-[12px] uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              Shop Originals
            </Link>
            <Link
              href="/prints"
              className="w-full sm:w-auto px-10 py-4 border-2 border-cream text-cream text-[12px] uppercase tracking-widest font-bold hover:bg-cream/10 transition-colors"
            >
              Gallery Walls
            </Link>
          </div>
        </div>
      </section>

      {/* Horizontal Collection Scroll (Gallery Walls) */}
      {collectionTiles.some((c) => c.item) && (
        <Reveal>
          <section className="py-16 md:py-24">
            <div className="flex justify-between items-end px-6 md:px-10 mb-8 max-w-7xl mx-auto">
              <h2 className="display text-3xl md:text-4xl font-normal">
                Curated Collections
              </h2>
              <Link href="/prints/archive" className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-ink-soft hover:text-ink">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 md:px-10 pb-8 custom-scrollbar">
              {collectionTiles
                .filter((c) => c.item)
                .map(({ name, item }) => (
                  <Link
                    key={name}
                    href={`/prints/archive?collection=${encodeURIComponent(name)}`}
                    className="group flex flex-col min-w-[280px] md:min-w-[320px] snap-start"
                  >
                    <div
                      className="overflow-hidden bg-paper w-full rounded-2xl mb-4 border border-line/40 transition-colors group-hover:border-ink/20"
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb(item!.imageUrl, 600)}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[14px] font-medium text-ink">
                        {name}
                      </span>
                      <ArrowUpRight size={16} className="text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* The Trust Bar */}
      <Reveal>
        <div className="w-full border-y border-line bg-paper py-5">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-y-4 gap-x-8 text-[11px] uppercase tracking-widest text-ink font-medium">
            <span className="flex items-center gap-2"><Check size={14} /> Museum Quality</span>
            <span className="flex items-center gap-2"><Check size={14} /> AR Wall Previews</span>
            <span className="flex items-center gap-2"><Check size={14} /> Framed & Ready to Hang</span>
          </div>
        </div>
      </Reveal>

      {/* Product Grid - Replacing static grid with dynamic client component */}
      <Reveal>
        <HomeProductGrid 
          originals={featuredPool} 
          archiveItems={archiveItems.slice(0, 8)} 
        />
      </Reveal>

      {/* Testimonials (The Kultured Effect) */}
      <Reveal>
        <div className="bg-paper border-y border-line">
          <Testimonials 
            eyebrow="The Canvas Effect" 
            title="Bringing emotion, identity, and cultural resonance into every room." 
          />
        </div>
      </Reveal>

      {/* Lifestyle (Kultured Homes) */}
      <Reveal>
        <div className="py-16 md:py-24">
          <RoomGallery
            eyebrow="Canvas Homes"
            title="See it in your space, not just on an easel."
          />
        </div>
      </Reveal>

      {/* Brand Philosophy Footer */}
      <Reveal>
        <section className="border-t border-line">
          <div className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center text-center px-6 overflow-hidden bg-ink">
            <Image
              src="/home/4.jpg" 
              alt="Talk Canvas Studio"
              fill
              className="object-cover opacity-50"
            />
            <h2 className="relative z-10 display text-4xl md:text-6xl text-cream leading-tight max-w-3xl">
              Painted by hand, printed with care. Made for you.
            </h2>
          </div>
          
          <div className="bg-cream py-20 px-6 text-center">
            <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-8">
              Our Product Philosophy
            </p>
            <p className="display text-2xl md:text-3xl leading-relaxed text-ink max-w-3xl mx-auto mb-8">
              "We believe a piece of art should mean something before it matches
              your sofa. Every work here is chosen, not generated—shaping spaces that feel personal and deeply meaningful."
            </p>
            <Link href="/about" className="text-[12px] uppercase tracking-widest font-bold border-b border-ink pb-1 hover:text-ink-soft hover:border-ink-soft transition-colors">
              Learn More
            </Link>
          </div>
        </section>
      </Reveal>

    </div>
  );
}
