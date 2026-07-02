import type { ReactNode } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I wasn't sure how the piece would feel in person — the AR preview meant there were no surprises when it arrived.",
    name: "Folake A.",
    location: "Lagos",
  },
  {
    quote:
      "Ordered a print of an archive piece I'd been eyeing for weeks. Framed and on the wall within days.",
    name: "Daniel O.",
    location: "Abuja",
  },
  {
    quote:
      "Bought an original after months of following the gallery. It's the first thing people ask about when they visit.",
    name: "Chiamaka N.",
    location: "London",
  },
];

export default function Testimonials({
  items = DEFAULT_TESTIMONIALS,
  eyebrow = "From the gallery floor",
  title,
}: {
  items?: Testimonial[];
  eyebrow?: string;
  title?: ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
      {/* Centered Header Section */}
      <div className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
          {eyebrow}
        </p>
        {title && (
          <h2 className="display text-3xl md:text-4xl font-normal">{title}</h2>
        )}
      </div>

      {/* E-commerce Style Review Cards */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {items.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col items-center text-center p-8 md:p-10 bg-paper rounded-2xl"
          >
            {/* Retail Trust Signal: 5 Stars */}
            <div className="flex gap-1 mb-6 text-ink">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
              ))}
            </div>

            <blockquote className="text-[14.5px] leading-relaxed text-ink-soft mb-8 grow">
              "{t.quote}"
            </blockquote>

            <figcaption className="text-[11px] uppercase tracking-widest text-ink font-medium">
              {t.name} <span className="text-ink-soft/40 mx-2">|</span>{" "}
              {t.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
