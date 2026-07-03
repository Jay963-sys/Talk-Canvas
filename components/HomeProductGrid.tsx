"use client";

import { useState } from "react";
import Link from "next/link";
import WorkCard from "@/components/WorkCard";

function thumb(url: string, width = 500): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function HomeProductGrid({
  originals,
  archiveItems,
}: {
  originals: any[];
  archiveItems: any[];
}) {
  const [tab, setTab] = useState<"originals" | "archive">("originals");

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-32">
      <div className="flex flex-col items-center text-center mb-12">
        <h2 className="display text-4xl md:text-5xl font-normal mb-8 leading-tight">
          Curated walls for <br className="hidden md:block" /> curated spaces.
        </h2>
        
        {/* Interactive Tabs */}
        <div className="flex gap-8 border-b border-line">
          <button
            onClick={() => setTab("originals")}
            className={`pb-3 text-[12px] uppercase tracking-widest transition-colors ${
              tab === "originals"
                ? "font-bold text-ink border-b-2 border-ink -mb-[2px]"
                : "font-medium text-ink-soft hover:text-ink"
            }`}
          >
            Featured Originals
          </button>
          <button
            onClick={() => setTab("archive")}
            className={`pb-3 text-[12px] uppercase tracking-widest transition-colors ${
              tab === "archive"
                ? "font-bold text-ink border-b-2 border-ink -mb-[2px]"
                : "font-medium text-ink-soft hover:text-ink"
            }`}
          >
            Archive Prints
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 min-h-[400px]">
        {tab === "originals"
          ? originals.map((work) => <WorkCard key={work.id} work={work} />)
          : archiveItems.map((item, i) => (
              <Link
                key={item.imageUrl || i}
                href="/prints/archive"
                className="group block overflow-hidden bg-paper rounded-xl border border-line/40 hover:border-ink/20 transition-colors"
                style={{ aspectRatio: `4/5` }}
              >
                <img
                  src={thumb(item.imageUrl)}
                  alt="Archive Print Preview"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
      </div>

      {/* Dynamic CTA Button */}
      <div className="mt-16 text-center">
        <Link
          href={tab === "originals" ? "/originals" : "/prints/archive"}
          className="inline-block px-8 py-4 border border-ink text-[12px] uppercase tracking-widest font-bold hover:bg-ink hover:text-cream transition-colors"
        >
          Explore {tab === "originals" ? "All Originals" : "All Archive Prints"}
        </Link>
      </div>
    </section>
  );
}
