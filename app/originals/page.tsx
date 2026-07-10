import { getAllOriginalsWithArtist } from "@/lib/db/queries/originals";
import Link from "next/link";
import {
  Eye as EyeIcon,
  ShoppingCart,
  Paintbrush,
  Truck,
  ArrowRight,
} from "lucide-react";
import Testimonials from "@/components/Testimonials";
import WorkCard from "@/components/WorkCard";
import { HOUSE_ARTIST_SLUG } from "@/lib/constants";

export const metadata = {
  title: "Talk Canvas Originals — Talk Canvas Gallery",
  description:
    "In-house studio designs, hand-painted to order on canvas. The same design can be recreated for your space.",
};

export const revalidate = 60;

const ACQUISITION_STEPS = [
  {
    icon: EyeIcon,
    title: "Browse the designs",
    description:
      "Explore our in-house studio designs. Each one is hand-painted to order for your space.",
  },
  {
    icon: ShoppingCart,
    title: "Add to cart",
    description:
      "Select a design and add it straight to your cart no waiting on a reply.",
  },
  {
    icon: Paintbrush,
    title: "We repaint it",
    description:
      "Complete payment online and we begin your hand-painted canvas, made just for you.",
  },
  {
    icon: Truck,
    title: "Delivery or pickup",
    description:
      "Repaints are produced in 5–7 working days, then delivered or ready to collect in Our Studio in Lagos.",
  },
];

export default async function OriginalsPage() {
  const all = await getAllOriginalsWithArtist();

  // Talk Canvas Originals only: house-artist works, plus any unlinked legacy
  // rows. One-of-one works by represented artists are excluded — they belong
  // on /artists.
  const works = all.filter(
    (w) => !w.artistSlug || w.artistSlug === HOUSE_ARTIST_SLUG,
  );

  return (
    <div className="fade-in bg-cream">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16 text-center">
        <h1 className="display text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6">
          Talk Canvas Originals
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
          Original designs from our studio, hand-painted on canvas. The exact
          piece you see can be recreated for your space, made to order.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      {/* Philosophy — repaint vs print, made-to-order (not one-of-one) */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
        <div className="bg-paper py-20 md:py-28 px-6 md:px-12 text-center rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <p className="display text-2xl md:text-4xl leading-[1.4] md:leading-[1.3] font-light">
              A print is a machine reproduction. A Talk Canvas Original is the
              same design hand-painted onto canvas, brushstroke by brushstroke,
              made to order for your wall — the depth and texture of real paint,
              without the one-of-one price.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="text-center mb-16">
          <h2 className="display text-3xl md:text-4xl font-normal mb-4">
            How it works.
          </h2>
          <p className="text-ink-soft">
            Four simple steps to a hand-painted original.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {ACQUISITION_STEPS.map((step) => (
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

      {/* Cross-sell to the one-of-one line — reinforces the distinction */}
      <section className="w-full bg-paper border-y border-line py-20 md:py-28 text-center px-6 md:px-10 mb-20 md:mb-32">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-6">
            Looking for one-of-one?
          </p>
          <h2 className="display text-3xl md:text-4xl font-normal mb-5">
            Original paintings by our represented artists
          </h2>
          <p className="text-[15px] text-ink-soft leading-relaxed mb-10">
            Each is a single, hand-painted work — once it sells, that exact
            piece is gone for good. Explore the artists we represent and the
            pieces they have available.
          </p>
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 px-10 py-4 bg-ink text-cream text-[12px] uppercase tracking-widest font-bold hover:bg-ink-soft transition-colors"
          >
            Meet the artists
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <Testimonials title="From collectors" />
    </div>
  );
}
