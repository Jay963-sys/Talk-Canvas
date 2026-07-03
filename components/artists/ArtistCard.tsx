import Link from "next/link";
import type { Artist } from "@/lib/db/schema";

function thumb(url: string, width = 600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
        {artist.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb(artist.portraitUrl)}
            alt={artist.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="display text-4xl text-ink-soft">
              {artist.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="display text-xl text-ink">{artist.name}</h3>
        {artist.location && (
          <p className="text-[12px] uppercase tracking-widest text-ink-soft mt-1">
            {artist.location}
          </p>
        )}
      </div>
    </Link>
  );
}
