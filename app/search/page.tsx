import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import WorkCard from "@/components/WorkCard";
import { getAllOriginals } from "@/lib/db/queries/originals";
// import { getArchivePage } from "@/lib/db/queries/archivePrints";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search | Talk Canvas Gallery",
  description: "Search the Talk Canvas Gallery collection.",
};

export default async function SearchPage({
  searchParams,
}: {
  // 1. Type searchParams as a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 2. Await the searchParams promise before accessing its properties
  const resolvedParams = await searchParams;

  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const decodedQuery = decodeURIComponent(query).trim();

  // Fetch data
  const allOriginals = await getAllOriginals();

  // Filter logic
  const searchResults = decodedQuery
    ? allOriginals.filter((work) => {
        const titleMatch = work.title
          ?.toLowerCase()
          .includes(decodedQuery.toLowerCase());
        const artistMatch = work.artist
          ?.toLowerCase()
          .includes(decodedQuery.toLowerCase());
        const mediumMatch = work.medium
          ?.toLowerCase()
          .includes(decodedQuery.toLowerCase());
        const descriptionMatch = work.description
          ?.toLowerCase()
          .includes(decodedQuery.toLowerCase());
        const slugMatch = work.slug
          ?.toLowerCase()
          .includes(decodedQuery.toLowerCase());

        return (
          titleMatch ||
          artistMatch ||
          mediumMatch ||
          descriptionMatch ||
          slugMatch
        );
      })
    : [];

  const hasResults = searchResults.length > 0;

  return (
    <div className="min-h-[70vh] bg-cream py-20 md:py-32 fade-in">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors mb-8"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to Gallery
          </Link>

          <h1 className="display text-4xl md:text-5xl font-normal mb-4">
            {decodedQuery ? (
              <>
                Search results for <br className="md:hidden" />
                <span className="text-ink-soft">"{decodedQuery}"</span>
              </>
            ) : (
              "Search the collection"
            )}
          </h1>

          {decodedQuery && (
            <p className="text-ink-soft mt-4">
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        {/* Results Grid */}
        {decodedQuery && hasResults && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {searchResults.map((work, i) => (
              <WorkCard key={work.id || i} work={work} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {decodedQuery && !hasResults && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mb-6">
              <SearchX size={28} strokeWidth={1.5} className="text-ink-soft" />
            </div>
            <h2 className="display text-2xl mb-3">No works found</h2>
            <p className="text-ink-soft max-w-md">
              We couldn't find anything matching "{decodedQuery}". Try checking
              for typos or searching by artist name instead.
            </p>
            <Link
              href="/originals"
              className="mt-8 px-8 py-3 bg-ink text-cream text-sm font-medium hover:bg-ink-soft transition-colors"
            >
              Explore all works
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
