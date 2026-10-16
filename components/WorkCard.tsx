import Link from "next/link";
import type { Original } from "@/lib/db/schema";
import { formatNaira } from "@/lib/store";
import { thumb } from "@/lib/cloudinaryLoader";

export default function WorkCard({ work }: { work: Original }) {
  return (
    <Link
      href={`/originals/${work.slug}`}
      prefetch={false}
      className="block group"
    >
      <div className="relative aspect-[4/5] bg-paper overflow-hidden mb-4 rounded-sm">
        {work.soldAt && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-ink text-cream text-[10px] uppercase font-medium tracking-widest z-10">
            Sold
          </span>
        )}
        <img
          src={thumb(work.imageUrl)}
          alt={work.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* 
        E-commerce style clean metadata (Left Aligned)
        Stripped away the extra details (year, dimensions) to focus on the product
      */}
      <div className="flex flex-col gap-0.5">
        <h3 className="display text-lg font-normal text-ink leading-tight">
          {work.title}
        </h3>
        <p className="text-[13px] text-ink-soft">{work.artist}</p>
        <p className="text-[14px] font-medium text-ink mt-1.5">
          {formatNaira(work.price)}
        </p>
      </div>
    </Link>
  );
}
