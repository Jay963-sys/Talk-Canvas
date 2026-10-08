import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { HOUSE_ARTIST_NAME, HOUSE_ARTIST_SLUG } from "@/lib/constants";
import { getFeaturedArtists } from "@/lib/db/queries/artists";
import Testimonials from "@/components/Testimonials";
import ArtistCard from "@/components/artists/ArtistCard";

export const metadata = {
  title: "Popular Artists — Talk Canvas Gallery",
  description:
    "Meet the artists behind the work — a curated selection of painters represented by Talk Canvas Gallery.",
};

export const revalidate = 86400;

export default async function ArtistsPage() {
  const artists = await getFeaturedArtists();

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <Link
            href="/originals"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Originals
          </Link>

          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
            The People
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
            Popular Artists
          </h1>

          <p className="text-[17px] text-ink-soft leading-relaxed max-w-xl mx-auto mt-2">
            A curated selection of original works from our represented artists.
            Each piece is one-of-one and comes with a certificate of
            authenticity, confirming its provenance and value.
          </p>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-ink-soft">No artists yet — check back soon.</p>
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </section>
        )}

        {/* The gallery's own collection sits apart from the artists it represents. */}
        <Link
          href={`/artists/${HOUSE_ARTIST_SLUG}`}
          className="group mt-20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-y border-line py-10"
        >
          <div>
            <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-2">
              The house collection
            </p>
            <h2 className="display text-3xl md:text-4xl font-normal">
              {HOUSE_ARTIST_NAME} Originals
            </h2>
            <p className="text-[15px] text-ink-soft mt-2 max-w-lg">
              Our own designs, painted by hand to order.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-ink-soft group-hover:text-ink transition-colors">
            View the collection <ArrowUpRight size={14} />
          </span>
        </Link>

        <div className="mt-32">
          <Testimonials title="From collectors" />
        </div>
      </div>
    </div>
  );
}
