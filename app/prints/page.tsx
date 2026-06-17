import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Configurator from "@/components/prints/Configurator";

export const metadata = {
  title: "Prints — Talk Canvas Gallery",
  description:
    "Upload your design or choose one from our archive, pick a frame, and preview it on your wall in AR.",
};

export default function PrintsPage() {
  return (
    <div className="fade-in">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          Editions
        </p>
        <h1 className="display text-6xl md:text-8xl font-normal leading-none mt-4">
          Print your work.
        </h1>
        <p className="text-[17px] text-ink-soft max-w-2xl mt-6 leading-relaxed">
          Upload a design or choose one from our archive, then pick your frame
          and size and preview it on your wall before checkout. Archival paper,
          gallery-grade framing.
        </p>
      </section>

      {/* Archive entry — for visitors without a design of their own */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-10">
        <Link
          href="/prints/archive"
          className="group flex items-center justify-between gap-4 border border-line bg-paper px-6 py-5 hover:border-ink transition-colors"
        >
          <p className="text-[15px] text-ink-soft">
            <span className="text-ink">Don&apos;t have a design?</span> Browse
            our archive of ready-to-frame prints.
          </p>
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink shrink-0">
            Browse
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </section>

      <Configurator />

      <section className="border-t border-line bg-paper">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Custom work
          </p>
          <h2 className="display text-3xl md:text-4xl font-normal mt-3 leading-tight">
            Need a <span className="display-italic">custom size</span> or
            special request?
          </h2>
          <p className="text-ink-soft mt-4 max-w-lg mx-auto leading-relaxed">
            For sizes or styles outside our standard catalog, a member of our
            team will work with you to bring your vision to life.
          </p>
          <Link
            href="/prints/custom"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 border border-ink text-ink uppercase text-xs tracking-[0.15em] hover:bg-ink hover:text-cream transition-colors"
          >
            Request a custom order
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
