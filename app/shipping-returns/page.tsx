export const metadata = {
  title: "Shipping & Returns — Talk Canvas Gallery",
  description:
    "How and when Talk Canvas ships within Nigeria, production timelines by piece type, and our returns policy.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
          Policies
        </p>
        <h1 className="display text-4xl md:text-5xl font-normal leading-tight mb-14">
          Shipping &amp; Returns
        </h1>

        {/* Shipping */}
        <section className="mb-16">
          <h2 className="display text-2xl md:text-3xl font-normal mb-6">
            Shipping
          </h2>
          <div className="space-y-5 text-[15px] text-ink-soft leading-relaxed">
            <p>
              Talk Canvas currently ships within Nigeria only. Delivery
              timelines depend on the type of piece you order. Framed prints and
              gallery wall pieces are produced within 3–5 working days before
              dispatch. Talk Canvas Originals repaints are produced within 5–7
              working days before dispatch. Represented artist one-of-one
              paintings, since they're already completed works, are delivered
              within a week of your order being confirmed.
            </p>
            <p>
              Once a piece is ready, deliveries within Lagos arrive the next
              day; deliveries outside Lagos take 2–3 days after production,
              depending on the courier handling that route.
            </p>
          </div>
        </section>

        {/* Returns */}
        <section>
          <h2 className="display text-2xl md:text-3xl font-normal mb-6">
            Returns
          </h2>
          <div className="space-y-5 text-[15px] text-ink-soft leading-relaxed">
            <p>
              Because represented artist originals are one-of-one works, they
              are not eligible for return once sold. For made-to-order repaints
              and prints, returns are accepted only in cases of a defect caused
              by us; change-of-mind returns are not offered on these custom
              pieces since they're produced specifically for your order.
            </p>
            <p>
              If a defect is found, let us know within 72 hours of receiving
              your piece and include photo evidence of the issue. Once approved,
              you'll send the piece back to us and we'll arrange getting the
              repaired or replacement piece back to you.
            </p>
          </div>

          {/* The one hard deadline, surfaced so it isn't missed. */}
          <div className="mt-8 border-l-2 border-ink bg-paper px-5 py-4">
            <p className="text-[13px] text-ink leading-relaxed">
              <span className="font-medium">Defect on arrival?</span> Contact us
              with photo evidence within{" "}
              <span className="font-medium">72 hours</span> of delivery to start
              a repair or replacement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
