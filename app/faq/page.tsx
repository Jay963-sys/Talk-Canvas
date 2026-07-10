import FaqAccordion, { type FaqGroup } from "@/components/FaqAccordion";

export const metadata = {
  title: "FAQs — Talk Canvas Gallery",
  description:
    "Answers to common questions about Talk Canvas pieces, custom orders, AR previews, shipping, and returns.",
};

const GROUPS: FaqGroup[] = [
  {
    title: "Pieces & authenticity",
    items: [
      {
        q: "What's the difference between a Popular Artist piece and a Talk Canvas Original?",
        a: "Popular Artist works are one-of-one paintings by our represented artists. Once sold, that exact piece is gone. Talk Canvas Originals are in-house designs that can be hand-repainted to order, so the same design can be recreated for you on canvas.",
      },
      {
        q: "How do I know a Popular Artist piece is genuinely one-of-one?",
        a: "Each of these works is sold with authentication tied to the artist and once marked sold on the site, that piece is no longer available in any form.",
      },
      {
        q: "What's the difference between a repaint and a print?",
        a: "A repaint is a hand-painted canvas recreation of a design; a print is a framed reproduction on canvas, made from your own uploaded image or from our archive.",
      },
    ],
  },
  {
    title: "Customizing & previewing",
    items: [
      {
        q: "Can I upload my own design?",
        a: "Yes, on the Gallery Wall page you can upload a JPG or PNG (up to 25MB) and choose your frame and size, or pick a design from our archive instead.",
      },
      {
        q: "Can I preview a piece on my wall before buying?",
        a: "Yes, the AR preview tool lets you see the piece at true size in your own space before you check out.",
      },
      {
        q: "What if I want a custom size or style outside your standard catalog?",
        a: "You can submit a custom order request and our team will work with you directly on sizing or style requests outside the standard options.",
      },
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      {
        q: "Where do you ship?",
        a: "Currently within Nigeria only.",
      },
      {
        q: "How long does production and delivery take?",
        a: "Framed prints take 3–5 working days to produce, Talk Canvas Original repaints take 5–7 working days, and represented artist paintings are shipped within a week of ordering since they're already complete. Once ready, Lagos deliveries arrive the next day, and deliveries outside Lagos take 2–3 days depending on the courier.",
      },
      {
        q: "Can I pick up my order instead of having it delivered?",
        a: "Yes, pickup is available from our Lekki, Lagos showroom as an alternative to delivery.",
      },
    ],
  },
  {
    title: "Returns",
    items: [
      {
        q: "Can I return a one-of-one painting?",
        a: "No, these are final sale once purchased, given their one-of-one nature.",
      },
      {
        q: "Can I return a repaint or print if I change my mind?",
        a: "No, these are made to order specifically for you, so change-of-mind returns aren't offered. Returns are only accepted if the piece arrives with a defect caused by us.",
      },
      {
        q: "What do I do if my piece arrives damaged or defective?",
        a: "Contact us with photo evidence within 72 hours of receiving it. Once approved, you'll send it back to us and we'll arrange a replacement or repair.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
          Good to know
        </p>
        <h1 className="display text-4xl md:text-5xl font-normal leading-tight mb-4">
          Frequently asked questions
        </h1>
        <p className="text-[15px] text-ink-soft leading-relaxed mb-14 max-w-xl">
          Everything you might want to know before you order. Still unsure?
          Reach out and we'll help.
        </p>

        <FaqAccordion groups={GROUPS} />
      </div>
    </div>
  );
}
