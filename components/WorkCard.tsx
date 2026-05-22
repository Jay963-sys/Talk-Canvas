import Link from "next/link";
import type { Original } from "@/lib/db/schema";
import { originalSizeLabel } from "@/lib/originalDisplay";
import { formatNaira } from "@/lib/store";

export default function WorkCard({ work }: { work: Original }) {
  return (
    <Link href={`/originals/${work.slug}`} className="block group">
      {/* Added 'relative' here so the absolute badge stays over the image */}
      <div className="relative bg-line overflow-hidden">
        {work.soldAt && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink/85 text-cream text-[10px] uppercase tracking-[0.15em] z-10">
            Sold
          </span>
        )}
        <img
          src={work.imageUrl}
          alt={work.title}
          className="w-full block transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="display-italic text-xl leading-tight">{work.title}</p>
          <p className="text-xs text-muted mt-1">
            {work.artist}, {work.year}
          </p>
          {/* Used your imported helper to show dimensions on the card */}
          <p className="text-xs text-muted mt-0.5">{originalSizeLabel(work)}</p>
        </div>
        <p className="text-xs text-ink-soft font-medium whitespace-nowrap pt-1">
          {formatNaira(work.price)}
        </p>
      </div>
    </Link>
  );
}
