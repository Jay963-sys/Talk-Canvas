import { getAllOriginals } from "@/lib/db/queries/originals";
import Link from "next/link";
import { MessageCircle, Eye as EyeIcon, Handshake, Truck } from "lucide-react";
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
    <div className="fade-in bg-cream">
      {/* Hero Section - Centered and Clean */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16 text-center">
        <h1 className="display text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6">
          Shop Originals
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
          A selection of recent work from our represented artists. Each piece is
          one-of-one. For enquiries about acquisition, pricing, or studio
          visits, please get in touch.
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

      {/* Represented artists - Clean comma list */}
      {artists.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 md:px-10 pb-24 md:pb-32 text-center">
          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-6">
            Represented Artists
          </p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
            {artists.map((name, i) => (
              <span key={name} className="text-xl md:text-2xl text-ink">
                {name}
                {i < artists.length - 1 ? (
                  <span className="text-ink-soft mx-2">,</span>
                ) : (
                  ""
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
