import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { Metadata } from "next";
import { getArtistBySlug, getAllArtists } from "@/lib/db/queries/artists";
import WorkCard from "@/components/WorkCard";

export const revalidate = 60;

export async function generateStaticParams() {
  const all = await getAllArtists();
  return all.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistBySlug(slug);
  if (!data) return { title: "Artist Not Found" };

  const { artist } = data;
  return {
    title: `${artist.name} — Talk Canvas Gallery`,
    description:
      artist.bio ?? `Original works by ${artist.name} at Talk Canvas Gallery.`,
    openGraph: {
      title: artist.name,
      description: artist.bio ?? `Original works by ${artist.name}.`,
      images: artist.portraitUrl ? [{ url: artist.portraitUrl }] : undefined,
      type: "profile",
    },
  };
}

function instagramHref(handle: string): string {
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getArtistBySlug(slug);
  if (!data) notFound();

  const { artist, works } = data;

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <Link
          href="/artists"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-10 md:mb-16"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Artists
        </Link>

        {/* Artist header */}
        <div className="grid md:grid-cols-[320px_1fr] gap-10 md:gap-16 mb-20 md:mb-28">
          {artist.portraitUrl && (
            <div className="relative aspect-[4/5] w-full max-w-[320px] bg-paper overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.portraitUrl}
                alt={artist.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col pt-2">
            {artist.location && (
              <p className="text-[12px] uppercase tracking-[0.15em] text-ink-soft font-medium mb-3">
                {artist.location}
              </p>
            )}
            <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal text-ink leading-tight mb-6">
              {artist.name}
            </h1>
            {artist.bio && (
              <p className="text-[14.5px] leading-relaxed text-ink-soft max-w-xl mb-8">
                {artist.bio}
              </p>
            )}

            {(artist.instagram || artist.website) && (
              <div className="flex items-center gap-4 mt-auto">
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors"
                  >
                    <Globe size={15} strokeWidth={1.5} />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Works */}
        <div className="mb-8">
          <h2 className="display text-2xl md:text-3xl font-normal">
            Available works
          </h2>
        </div>

        {works.length === 0 ? (
          <div className="border border-dashed border-line p-16 text-center">
            <p className="text-sm text-ink-soft">
              No works currently available from this artist.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
