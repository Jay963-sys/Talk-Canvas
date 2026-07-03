import { db } from "../index";
import {
  artists,
  originals,
  type Artist,
  type NewArtist,
  type Original,
} from "../schema";
import { eq, and, asc, desc } from "drizzle-orm";

// ── PUBLIC QUERIES (visible only) ────────────────────────────────

/**
 * Full public directory — every visible artist.
 */
export async function getAllArtists(): Promise<Artist[]> {
  return await db
    .select()
    .from(artists)
    .where(eq(artists.isVisible, true))
    .orderBy(asc(artists.displayOrder), asc(artists.name));
}

/**
 * Curated "Popular Artists" surface — visible AND featured.
 */
export async function getFeaturedArtists(): Promise<Artist[]> {
  return await db
    .select()
    .from(artists)
    .where(and(eq(artists.isVisible, true), eq(artists.featured, true)))
    .orderBy(asc(artists.displayOrder), asc(artists.name));
}

/**
 * Artist detail page: the artist plus their visible works for sale.
 * Returns undefined if the slug doesn't resolve to a visible artist.
 */
export async function getArtistBySlug(
  slug: string,
): Promise<{ artist: Artist; works: Original[] } | undefined> {
  const [artist] = await db
    .select()
    .from(artists)
    .where(and(eq(artists.slug, slug), eq(artists.isVisible, true)))
    .limit(1);
  if (!artist) return undefined;

  const works = await db
    .select()
    .from(originals)
    .where(
      and(eq(originals.artistId, artist.id), eq(originals.isVisible, true)),
    )
    .orderBy(asc(originals.displayOrder), asc(originals.id));

  return { artist, works };
}

// ── ADMIN QUERIES (all artists, including hidden) ────────────────

export async function getAllArtistsForAdmin(): Promise<Artist[]> {
  return await db
    .select()
    .from(artists)
    .orderBy(asc(artists.displayOrder), desc(artists.id));
}

export async function getArtistById(id: number): Promise<Artist | undefined> {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.id, id))
    .limit(1);
  return artist;
}

/**
 * Lightweight { id, name } list for the artist <select> on OriginalForm.
 */
export async function getArtistOptions(): Promise<
  { id: number; name: string }[]
> {
  return await db
    .select({ id: artists.id, name: artists.name })
    .from(artists)
    .orderBy(asc(artists.name));
}

export async function createArtist(data: NewArtist): Promise<Artist> {
  const [created] = await db.insert(artists).values(data).returning();
  return created;
}

export async function updateArtist(
  id: number,
  data: Partial<NewArtist>,
): Promise<Artist | undefined> {
  const [updated] = await db
    .update(artists)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(artists.id, id))
    .returning();
  return updated;
}

/**
 * Delete an artist. Because originals.artistId is onDelete "set null",
 * their works survive and fall back to the `artist` text byline.
 */
export async function deleteArtist(id: number): Promise<void> {
  await db.delete(artists).where(eq(artists.id, id));
}
