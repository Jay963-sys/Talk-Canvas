import { db } from "../index";
import { originals, artists, type Original, type NewOriginal } from "../schema";
import { eq, asc, desc } from "drizzle-orm";
import { inArray, isNull, isNotNull } from "drizzle-orm";
import { ilike, or } from "drizzle-orm";

/**
 * An original joined with its (nullable) artist row, flattened for display.
 * artistName/artistSlug are null only if artistId is unset — the `artist`
 * text field on Original is always present as a fallback byline.
 */
export type OriginalWithArtist = Original & {
  artistName: string | null;
  artistSlug: string | null;
};

function withArtist(row: {
  originals: Original;
  artists: { name: string; slug: string } | null;
}): OriginalWithArtist {
  return {
    ...row.originals,
    artistName: row.artists?.name ?? null,
    artistSlug: row.artists?.slug ?? null,
  };
}

/**
 * Used to validate cart items at checkout — fetch all referenced originals
 * in one query so the API can verify they still exist and aren't sold.
 */
export async function getOriginalsByIds(ids: number[]): Promise<Original[]> {
  if (ids.length === 0) return [];
  return await db.select().from(originals).where(inArray(originals.id, ids));
}

/**
 * Mark an original as sold. Called after an order is successfully created.
 */
export async function markOriginalSold(id: number): Promise<void> {
  await db
    .update(originals)
    .set({ soldAt: new Date(), updatedAt: new Date() })
    .where(eq(originals.id, id));
}

/**
 * Reverse the sold flag — used by admin in case of cancelled order or
 * an accidental mark.
 */
export async function markOriginalAvailable(id: number): Promise<void> {
  await db
    .update(originals)
    .set({ soldAt: null, updatedAt: new Date() })
    .where(eq(originals.id, id));
}

/**
 * Available-only listing — useful for the home page featured grid
 * where we want to highlight pieces customers can still buy.
 * The /originals page itself will keep showing sold pieces with a badge
 * (gallery convention — sold pieces are social proof).
 */
export async function getAvailableOriginals(): Promise<Original[]> {
  return await db
    .select()
    .from(originals)
    .where(isNull(originals.soldAt))
    .orderBy(originals.displayOrder);
}

// ── PUBLIC QUERIES (visible only) ────────────────────────────────
export async function getAllOriginals(): Promise<Original[]> {
  return await db
    .select()
    .from(originals)
    .where(eq(originals.isVisible, true))
    .orderBy(asc(originals.displayOrder), asc(originals.id));
}

export async function getOriginalBySlug(
  slug: string,
): Promise<Original | undefined> {
  const result = await db
    .select()
    .from(originals)
    .where(eq(originals.slug, slug))
    .limit(1);
  return result[0];
}

// ── ARTIST-AWARE PUBLIC QUERIES ──────────────────────────────────
// Additive variants that carry the joined artist byline. Existing callers
// keep using the plain functions above; anything that needs to link to the
// artist page uses these. leftJoin so an unlinked original still renders.

export async function getAllOriginalsWithArtist(): Promise<
  OriginalWithArtist[]
> {
  const rows = await db
    .select({ originals, artists })
    .from(originals)
    .leftJoin(artists, eq(originals.artistId, artists.id))
    .where(eq(originals.isVisible, true))
    .orderBy(asc(originals.displayOrder), asc(originals.id));
  return rows.map(withArtist);
}

export async function getOriginalBySlugWithArtist(
  slug: string,
): Promise<OriginalWithArtist | undefined> {
  const rows = await db
    .select({ originals, artists })
    .from(originals)
    .leftJoin(artists, eq(originals.artistId, artists.id))
    .where(eq(originals.slug, slug))
    .limit(1);
  return rows[0] ? withArtist(rows[0]) : undefined;
}

/**
 * All visible works for one artist — powers /artists/[slug].
 */
export async function getOriginalsByArtistId(
  artistId: number,
): Promise<Original[]> {
  return await db
    .select()
    .from(originals)
    .where(eq(originals.artistId, artistId))
    .orderBy(asc(originals.displayOrder), asc(originals.id));
}

// ── ADMIN QUERIES (all originals, including hidden) ──────────────
export async function getAllOriginalsForAdmin(): Promise<Original[]> {
  return await db
    .select()
    .from(originals)
    .orderBy(asc(originals.displayOrder), desc(originals.id));
}

export async function getOriginalById(
  id: number,
): Promise<Original | undefined> {
  const result = await db
    .select()
    .from(originals)
    .where(eq(originals.id, id))
    .limit(1);
  return result[0];
}

export async function createOriginal(data: NewOriginal): Promise<Original> {
  const [created] = await db.insert(originals).values(data).returning();
  return created;
}

export async function updateOriginal(
  id: number,
  data: Partial<NewOriginal>,
): Promise<Original | undefined> {
  const [updated] = await db
    .update(originals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(originals.id, id))
    .returning();
  return updated;
}

export async function deleteOriginal(id: number): Promise<void> {
  await db.delete(originals).where(eq(originals.id, id));
}

export async function searchOriginals(query: string) {
  // Wrap the query in % wildcards so it matches text anywhere in the string
  const searchTerm = `%${query}%`;

  return (
    db
      .select()
      .from(originals)
      .where(
        or(
          ilike(originals.title, searchTerm),
          ilike(originals.artist, searchTerm),
          ilike(originals.medium, searchTerm),
          ilike(originals.description, searchTerm),
          ilike(originals.slug, searchTerm),
        ),
      )
      // Optional: Add a limit so a vague search doesn't return thousands of rows
      .limit(50)
  );
}
