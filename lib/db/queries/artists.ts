import { cache } from "react";
import { db } from "../index";
import {
  artists,
  originals,
  type Artist,
  type NewArtist,
  type Original,
} from "../schema";
import { eq, ne, and, asc, desc } from "drizzle-orm";
import { HOUSE_ARTIST_SLUG } from "@/lib/constants";

export async function getAllArtists(): Promise<Artist[]> {
  return await db
    .select()
    .from(artists)
    .where(eq(artists.isVisible, true))
    .orderBy(asc(artists.displayOrder), asc(artists.name));
}

export async function getFeaturedArtists(): Promise<Artist[]> {
  return await db
    .select()
    .from(artists)
    .where(
      and(
        eq(artists.isVisible, true),
        eq(artists.featured, true),
        ne(artists.slug, HOUSE_ARTIST_SLUG),
      ),
    )
    .orderBy(asc(artists.displayOrder), asc(artists.name));
}

export const getArtistBySlug = cache(
  async (
    slug: string,
  ): Promise<{ artist: Artist; works: Original[] } | undefined> => {
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
  },
);

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

export async function deleteArtist(id: number): Promise<void> {
  await db.delete(artists).where(eq(artists.id, id));
}
