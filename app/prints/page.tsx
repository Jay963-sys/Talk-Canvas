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
    <div className="fade-in bg-cream">
      {/* Hero - Centered and Minimalist */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16 text-center">
        <h1 className="display text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6">
          Gallery Walls
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
          Upload a design or choose one from our archive, then pick your frame
          and size and preview it on your wall before checkout. Archival paper,
          gallery-grade framing.
        </p>
      </section>

      {/* Main Configurator Component */}
      <div className="mb-24">
        <Configurator />
      </div>

      {/* Archive entry CTA — Styled as a sleek banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="bg-paper rounded-2xl p-8 md:p-12 text-center">
          <h2 className="display text-3xl mb-4">Don't have a design?</h2>
          <p className="text-[15px] text-ink-soft mb-8">
            Browse our curated archive of ready-to-frame prints.
          </p>
          <Link
            href="/prints/archive"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
          >
            Browse Archive
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Archive preview strip - Enforced 4/5 aspect ratio grid */}
      {archivePreview.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {archivePreview.map((item) => (
              <Link
                key={item.id}
                href="/prints/archive"
                className="group block overflow-hidden bg-paper rounded-xl"
              >
                <div className="relative aspect-[4/5] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(item.imageUrl)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Sets entry CTA — Styled as a dark companion banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="bg-ink text-cream rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="display text-3xl mb-4">Hang Together</h2>
            <p className="text-[15px] text-ink-soft mb-0">
              Some pieces are made to hang as a group. Explore our curated
              sets—artworks designed to share the same space and framed to
              match.
            </p>
          </div>
          <Link
            href="/prints/sets"
            className="shrink-0 inline-flex items-center gap-2 px-8 py-3.5 bg-cream text-ink text-[12px] uppercase tracking-widest font-medium hover:bg-paper transition-colors"
          >
            Shop Sets
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
      
      {/* See it in your space */}
      <div className="py-10">
        <RoomGallery />
      </div>

      {/* How it works - Centered and borderless */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="text-center mb-16">
          <h2 className="display text-3xl md:text-4xl font-normal mb-4">
            From archive to your wall.
          </h2>
          <p className="text-ink-soft">
            Four simple steps to elevate your space.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {STEPS.map((step, i) => (
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

      {/* Custom order CTA - Dark banner styling */}
      <section className="bg-ink text-cream py-24 md:py-32 rounded-t-3xl mx-6 md:mx-10">
        <div className="max-w-3xl mx-auto text-center px-6">
          <p className="text-[11px] uppercase tracking-widest text-ink-soft mb-6">
            Custom Work
          </p>
          <h2 className="display text-3xl md:text-5xl font-normal mb-6 leading-tight">
            Need a custom size or special request?
          </h2>
          <p className="text-[15px] text-ink-soft max-w-lg mx-auto leading-relaxed mb-10">
            For sizes or styles outside our standard catalog, a member of our
            team will work with you to bring your vision to life.
          </p>
          <Link
            href="/prints/custom"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cream text-ink text-[12px] uppercase tracking-widest font-medium hover:bg-paper transition-colors"
          >
            Request a custom order
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <div className="mt-10">
        <Testimonials title="On the wall" />
      </div>
    </div>
  );
}
