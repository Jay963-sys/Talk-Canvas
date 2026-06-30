import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Frame as FrameIcon,
  Eye,
  PackageCheck,
} from "lucide-react";
import Configurator from "@/components/prints/Configurator";
import RoomGallery from "@/components/prints/RoomGallery";
import Testimonials from "@/components/Testimonials";
import { getArchivePage } from "@/lib/db/queries/archivePrints";

export const metadata = {
  title: "Prints — Talk Canvas Gallery",
  description:
    "Upload your design or choose one from our archive, pick a frame, and preview it on your wall in AR.",
};

export const revalidate = 60;

function thumb(url: string, width = 500): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

const STEPS = [
  {
    icon: Upload,
    title: "Choose a piece",
    description:
      "Upload your own design or pick one from our archive — no design experience needed.",
  },
  {
    icon: FrameIcon,
    title: "Pick frame & size",
    description:
      "Choose the frame style, colour, and dimensions that fit your space.",
  },
  {
    icon: Eye,
    title: "Preview in AR",
    description:
      "See it on your actual wall, true to scale, before you commit to buy.",
  },
  {
    icon: PackageCheck,
    title: "Framed & delivered",
    description: "Arrives ready to hang — no separate framing required.",
  },
];

export default async function PrintsPage() {
  const { items: archivePreview } = await getArchivePage(undefined, 4);

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

      {/* Archive preview strip */}
      {archivePreview.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {archivePreview.map((item) => (
              <Link
                key={item.id}
                href="/prints/archive"
                className="group block overflow-hidden bg-paper"
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb(item.imageUrl)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Configurator />

      {/* See it in your space */}
      <RoomGallery />

      {/* How it works */}
      <section className="bg-paper border-y border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
            The process
          </p>
          <h2 className="display text-3xl md:text-4xl font-normal mb-14 max-w-lg leading-[1.1]">
            From archive to your wall, in four steps.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="lg:border-l lg:border-line lg:pl-6 first:lg:border-l-0 first:lg:pl-0"
              >
                <span className="font-mono text-[11px] text-muted">
                  0{i + 1}
                </span>
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
        </div>
      </section>

      {/* Custom order CTA */}
      <section className="border-b border-line">
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

      <Testimonials title="On the wall" />
    </div>
  );
}
