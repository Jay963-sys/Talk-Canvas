import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ORIGINALS } from "@/data/originals";
import WorkCard from "@/components/WorkCard";

export default function Home() {
  const featured = ORIGINALS.slice(0, 4);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-28 pb-20 md:pb-32">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
              Est. Lagos — Contemporary works & fine-art prints
            </p>
            <h1 className="display font-normal leading-[0.95] text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]">
              A space for
              <br />
              <span className="display-italic font-light">quiet looking.</span>
            </h1>
          </div>
          <div className="md:col-span-4 md:pl-8">
            <p className="text-[17px] leading-relaxed text-ink-soft max-w-sm">
              Talk Canvas Gallery represents painters working across Nigeria and
              the diaspora. We also produce archival prints from your own
              designs, framed and ready to hang.
            </p>
          </div>
        </div>
      </section>

      {/* Two pillars */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <PillarCard
            href="/originals"
            label="01 / Gallery"
            title="Originals"
            description="Hand-painted, one-of-one works from our roster of represented artists. Available for acquisition or enquiry."
            img="https://picsum.photos/seed/originals/900/1100"
          />
          <PillarCard
            href="/prints"
            label="02 / Editions"
            title="Prints"
            description="Upload your own design, choose a frame and size, and preview it on your wall in AR before you buy."
            img="https://picsum.photos/seed/prints/900/1100"
            accent
          />
        </div>
      </section>

      {/* Currently on view */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-32">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="display text-3xl md:text-4xl lg:text-5xl font-normal">
            Currently on view
          </h2>
          <Link
            href="/originals"
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
          >
            See all works <ArrowUpRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PillarCard({
  href,
  label,
  title,
  description,
  img,
  accent,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  img: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`p-8 flex flex-col min-h-[520px] relative overflow-hidden transition-transform duration-500 hover:-translate-y-1 ${
        accent ? "bg-ink text-cream" : "bg-paper text-ink"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.15em] opacity-60">{label}</p>
      <h3 className="display text-5xl md:text-6xl font-normal mt-3 leading-none">
        {title}
      </h3>
      <div className="flex-1 mt-6 overflow-hidden">
        <img
          src={img}
          alt=""
          className={`w-full h-full object-cover ${accent ? "brightness-90 saturate-75" : ""}`}
        />
      </div>
      <div className="flex items-end justify-between mt-6">
        <p className="text-[15px] leading-relaxed opacity-85 max-w-xs">
          {description}
        </p>
        <ArrowUpRight size={28} strokeWidth={1.25} className="shrink-0 ml-4" />
      </div>
    </Link>
  );
}
