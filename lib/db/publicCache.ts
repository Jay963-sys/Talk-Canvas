import { unstable_cache } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "./index";
import { artists, originals, type Artist, type Original } from "./schema";
import type { OriginalWithArtist } from "./queries/originals";
import { getTestimonials } from "./queries/testimonials";
import {
  getArchiveCatalogue,
  pageFromCatalogue,
  type ArchiveOrientation,
  type ArchivePage,
} from "./queries/archivePrints";
import { HOUSE_ARTIST_SLUG } from "@/lib/constants";
import {
  DEFAULT_ARCHIVE_CATEGORY,
  type ArchiveCategory,
} from "@/data/collections";

/**
 * Cached reads for the PUBLIC storefront. Admin pages keep using the live
 * queries in ./queries.
 *
 * Why: storefront pages are ISR with a 24h lifetime, and each page (every
 * original, every artist) used to run its own query when it regenerated. Bots
 * crawl those pages all day, so pages expired and regenerated one by one —
 * each one waking Neon. Now every page reads from a few shared cache entries:
 * one Neon query refreshes all originals, one all artists, and so on.
 *
 * Freshness: every admin edit and every sale calls revalidateStorefront(),
 * which expires the "storefront" and "archive" tags immediately.
 */

const DAY = 86400;

// The data cache stores JSON, so Dates come back as strings. Turn them back
// into Dates so the types stay honest.
const DATE_KEYS = ["soldAt", "createdAt", "updatedAt"] as const;
function reviveDates<T extends object>(row: T): T {
  const out = { ...row } as Record<string, unknown>;
  for (const k of DATE_KEYS) {
    const v = out[k];
    if (typeof v === "string") out[k] = new Date(v);
  }
  return out as T;
}

// ── Originals ────────────────────────────────────────────────────

/** Every original (hidden included, so slug lookups behave as before) with its artist. */
const originalsCatalogue = unstable_cache(
  async (): Promise<OriginalWithArtist[]> => {
    const rows = await db
      .select({ originals, artists })
      .from(originals)
      .leftJoin(artists, eq(originals.artistId, artists.id))
      .orderBy(asc(originals.displayOrder), asc(originals.id));
    return rows.map((r) => ({
      ...r.originals,
      artistName: r.artists?.name ?? null,
      artistSlug: r.artists?.slug ?? null,
    }));
  },
  ["public-originals-catalogue"],
  { revalidate: DAY, tags: ["storefront"] },
);

async function getOriginalsCatalogue(): Promise<OriginalWithArtist[]> {
  return (await originalsCatalogue()).map(reviveDates);
}

/** Strip the joined artist fields to get a plain Original. */
function toOriginal(o: OriginalWithArtist): Original {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { artistName, artistSlug, ...rest } = o;
  return rest;
}

export async function getPublicOriginals(): Promise<Original[]> {
  return (await getOriginalsCatalogue())
    .filter((o) => o.isVisible)
    .map(toOriginal);
}

export async function getPublicOriginalsWithArtist(): Promise<
  OriginalWithArtist[]
> {
  return (await getOriginalsCatalogue()).filter((o) => o.isVisible);
}

export async function getPublicOriginalBySlug(
  slug: string,
): Promise<OriginalWithArtist | undefined> {
  return (await getOriginalsCatalogue()).find((o) => o.slug === slug);
}

// ── Artists ──────────────────────────────────────────────────────

const artistsCatalogue = unstable_cache(
  async (): Promise<Artist[]> =>
    db
      .select()
      .from(artists)
      .where(eq(artists.isVisible, true))
      .orderBy(asc(artists.displayOrder), asc(artists.name)),
  ["public-artists-catalogue"],
  { revalidate: DAY, tags: ["storefront"] },
);

export async function getPublicArtists(): Promise<Artist[]> {
  return (await artistsCatalogue()).map(reviveDates);
}

export async function getPublicFeaturedArtists(): Promise<Artist[]> {
  return (await getPublicArtists()).filter(
    (a) => a.featured && a.slug !== HOUSE_ARTIST_SLUG,
  );
}

export async function getPublicArtistBySlug(
  slug: string,
): Promise<{ artist: Artist; works: Original[] } | undefined> {
  const artist = (await getPublicArtists()).find((a) => a.slug === slug);
  if (!artist) return undefined;
  const works = (await getOriginalsCatalogue())
    .filter((o) => o.artistId === artist.id && o.isVisible)
    .map(toOriginal);
  return { artist, works };
}

// ── Testimonials ─────────────────────────────────────────────────

const testimonialsCache = unstable_cache(
  () => getTestimonials(),
  ["public-testimonials"],
  { revalidate: DAY, tags: ["storefront"] },
);

export async function getPublicTestimonials() {
  return (await testimonialsCache()).map(reviveDates);
}

// ── Archive ──────────────────────────────────────────────────────
// Same cache entry as /api/archive-prints, so pages and the scroll feed share it.

export const getCachedArchiveCatalogue = unstable_cache(
  () => getArchiveCatalogue(),
  ["archive-catalogue"],
  { revalidate: DAY, tags: ["archive"] },
);

async function archiveRows() {
  return (await getCachedArchiveCatalogue()).map(reviveDates);
}

export async function getPublicArchivePage(
  cursor?: number,
  pageSize?: number,
  category?: ArchiveCategory,
  orientation?: ArchiveOrientation,
  setsOnly?: boolean,
): Promise<ArchivePage> {
  return pageFromCatalogue(
    await archiveRows(),
    cursor,
    pageSize,
    category,
    orientation,
    setsOnly,
  );
}

/** Same counts as getArchiveCategoryCounts: canonical rows only, per category. */
export async function getPublicArchiveCategoryCounts(
  orientation?: ArchiveOrientation,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const r of await archiveRows()) {
    if (r.setId !== null && r.setPosition !== 1) continue;
    if (orientation && r.orientation !== orientation) continue;
    const key = r.collection ?? DEFAULT_ARCHIVE_CATEGORY;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
