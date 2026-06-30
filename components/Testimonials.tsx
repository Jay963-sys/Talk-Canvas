import type { ReactNode } from "react";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

// Placeholder copy — swap these for real client quotes before launch.
// Keep them short (under ~30 words) so they read like wall text, not reviews.
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
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-line">
      <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
        {eyebrow}
      </p>
      {title && (
        <h2 className="display text-3xl md:text-4xl font-normal mb-12 leading-[1.1]">
          {title}
        </h2>
      )}
      <div className="grid md:grid-cols-3 gap-10 md:gap-12">
        {items.map((t, i) => (
          <figure
            key={i}
            className="md:border-l md:border-line md:pl-8 first:md:border-l-0 first:md:pl-0"
          >
            <blockquote className="display-italic text-xl md:text-2xl leading-snug text-ink">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              {t.name} — {t.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
