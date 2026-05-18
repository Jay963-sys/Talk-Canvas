import Link from "next/link";
import type { Original } from "@/data/originals";

export default function WorkCard({ work }: { work: Original }) {
  return (
    <Link href={`/originals/${work.id}`} className="block group">
      <div className="bg-line overflow-hidden">
        <img
          src={work.img}
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
        </div>
        <p className="text-xs text-ink-soft font-medium whitespace-nowrap pt-1">
          {work.price}
        </p>
      </div>
    </Link>
  );
}
