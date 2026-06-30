import { getAllOriginals } from "@/lib/db/queries/originals";
import Link from "next/link";
import { MessageCircle, Eye as EyeIcon, Handshake, Truck } from "lucide-react";
import { formatNaira } from "@/lib/store";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Originals — Talk Canvas Gallery",
  description: "Hand-painted works from our represented artists.",
};

export const revalidate = 60;

const ACQUISITION_STEPS = [
  {
    icon: EyeIcon,
    title: "Browse the gallery",
    description: "Each piece is one-of-one — what you see is what's available.",
  },
  {
    icon: MessageCircle,
    title: "Enquire",
    description:
      "Reach out about a piece. We'll share more on the work and the artist.",
  },
  {
    icon: Handshake,
    title: "Secure it",
    description:
      "Once terms are agreed, the piece is marked sold and held for you.",
  },
  {
    icon: Truck,
    title: "Delivery or pickup",
    description:
      "We arrange safe delivery, or you're welcome to collect from us in Lagos.",
  },
];

export default async function OriginalsPage() {
  const works = await getAllOriginals();
  const artists = Array.from(new Set(works.map((w) => w.artist)));

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

      {/* Philosophy */}
      <section className="border-t border-line bg-paper">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-24 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
            Why originals
          </p>
          <p className="display text-2xl md:text-4xl leading-[1.3] md:leading-[1.25]">
            A print is a copy.{" "}
            <span className="display-italic">
              An original is the only one that will ever exist
            </span>{" "}
            — the brushwork, the decisions, the hours, all in one piece, on your
            wall, nowhere else.
          </p>
        </div>
      </section>

      {/* How acquisition works */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24">
        <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
          Acquiring a piece
        </p>
        <h2 className="display text-3xl md:text-4xl font-normal mb-14 max-w-lg leading-[1.1]">
          How it works.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {ACQUISITION_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="lg:border-l lg:border-line lg:pl-6 first:lg:border-l-0 first:lg:pl-0"
            >
              <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
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
      </section>

      {/* Represented artists */}
      {artists.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-24 border-t border-line pt-16">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
            Represented artists
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-3">
            {artists.map((name, i) => (
              <span key={name} className="flex items-center">
                <span className="display-italic text-2xl md:text-3xl text-ink-soft">
                  {name}
                </span>
                {i < artists.length - 1 && (
                  <span className="text-line text-2xl md:text-3xl ml-3">·</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      <Testimonials title="From collectors" />
    </div>
  );
}
