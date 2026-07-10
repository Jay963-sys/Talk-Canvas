import { getAllOriginalsWithArtist } from "@/lib/db/queries/originals";
import Link from "next/link";
import {
  MessageCircle,
  Eye as EyeIcon,
  Handshake,
  Truck,
  ShoppingCart,
} from "lucide-react";
import Testimonials from "@/components/Testimonials";
import WorkCard from "@/components/WorkCard";

export const metadata = {
  title: "Originals — Talk Canvas Gallery",
  description: "Hand-painted works from our represented artists.",
};

export const revalidate = 60;

const ACQUISITION_STEPS = [
  {
    icon: EyeIcon,
    title: "Browse the gallery",
    description: "Each piece is one of one.  what you see is what's available.",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description:
      "Select the piece and add it straight to your cart, no waiting on a reply.",
  },
  {
    icon: Handshake,
    title: "Checkout",
    description:
      "Complete payment online and the piece is marked sold immediately",
  },
  {
    icon: Truck,
    title: "Delivery or pickup",
    description:
      "We arrange safe delivery, or you're welcome to collect from us in Lagos.",
  },
];

export default async function OriginalsPage() {
  const works = await getAllOriginalsWithArtist();

  // Unique linked artists, deduped by slug, in first-appearance order.
  const artistList = Array.from(
    new Map(
      works
        .filter((w) => w.artistSlug)
        .map((w) => [
          w.artistSlug as string,
          { name: w.artistName as string, slug: w.artistSlug as string },
        ]),
    ).values(),
  );

  return (
    <div className="fade-in bg-cream">
      {/* Hero Section - Centered and Clean */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16 text-center">
        <h1 className="display text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6">
          Talk Canvas Originals
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
          Original designs from our studio, hand-painted on canvas. the exact
          piece you see can be recreated for your space, made to order.
        </p>
      </section>

      {/* Grid Section - Using strict CSS Grid and the WorkCard component */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      {/* Philosophy - Styled as a soft, rounded banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
        <div className="bg-paper py-20 md:py-28 px-6 md:px-12 text-center rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <p className="display text-2xl md:text-4xl leading-[1.4] md:leading-[1.3] font-light">
              A print is a copy. An original is the only one that will ever
              exist — the brushwork, the decisions, the hours, all in one piece,
              on your wall, nowhere else.
            </p>
          </div>
        </div>
      </section>

      {/* How acquisition works - Centered icons without borders */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="text-center mb-16">
          <h2 className="display text-3xl md:text-4xl font-normal mb-4">
            How to acquire a piece.
          </h2>
          <p className="text-ink-soft">
            Four simple steps to secure an original work.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {ACQUISITION_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mb-6 border border-line/40">
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

      {/* Represented artists - Full-width dedicated block */}
      {artistList.length > 0 && (
        <section className="w-full bg-paper border-y border-line py-20 md:py-28 text-center px-6 md:px-10 mb-20 md:mb-32">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-8">
              Represented Artists
            </p>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-4 mb-12">
              {artistList.map((artist, i) => (
                <span
                  key={artist.slug}
                  className="display text-3xl md:text-4xl text-ink"
                >
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="hover:text-ink-soft transition-colors"
                  >
                    {artist.name}
                  </Link>
                  {i < artistList.length - 1 ? (
                    <span className="text-ink-soft mx-3">,</span>
                  ) : (
                    ""
                  )}
                </span>
              ))}
            </div>
            <Link
              href="/artists"
              className="inline-block px-10 py-4 bg-ink text-cream text-[12px] uppercase tracking-widest font-bold hover:bg-ink-soft transition-colors"
            >
              Meet the artists
            </Link>
          </div>
        </section>
      )}

      <Testimonials title="From collectors" />
    </div>
  );
}
