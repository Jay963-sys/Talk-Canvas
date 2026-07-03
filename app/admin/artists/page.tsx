import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllArtistsForAdmin } from "@/lib/db/queries/artists";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const artists = await getAllArtistsForAdmin();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="display text-3xl font-normal">Artists</h1>
          <p className="text-sm text-ink-soft mt-1">
            {artists.length} {artists.length === 1 ? "artist" : "artists"} ·
            featured artists appear in Popular Artists
          </p>
        </div>
        <Link
          href="/admin/artists/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-cream text-xs uppercase tracking-[0.15em] hover:bg-ink-soft transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          New artist
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="text-sm text-ink-soft">
            No artists yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="border border-line divide-y divide-line">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/admin/artists/${artist.id}`}
              className="flex items-center gap-4 p-4 hover:bg-paper transition-colors"
            >
              <div className="w-12 h-12 bg-paper border border-line overflow-hidden shrink-0">
                {artist.portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artist.portraitUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{artist.name}</p>
                <p className="text-xs text-muted truncate">
                  /artists/{artist.slug}
                  {artist.location ? ` · ${artist.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {artist.featured && (
                  <span className="px-2 py-1 bg-ink text-cream text-[10px] uppercase tracking-widest">
                    Featured
                  </span>
                )}
                {!artist.isVisible && (
                  <span className="px-2 py-1 border border-line text-ink-soft text-[10px] uppercase tracking-widest">
                    Hidden
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
