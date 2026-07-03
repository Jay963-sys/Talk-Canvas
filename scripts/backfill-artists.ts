/**
 * scripts/backfill-artists.ts
 *
 * One-time data migration to populate the artists table from existing
 * originals. Safe to re-run — every step is idempotent.
 *
 * Run AFTER `drizzle-kit generate` + `drizzle-kit migrate` have added the
 * artists table and the nullable originals.artist_id column:
 *
 *   npx tsx scripts/backfill-artists.ts
 *
 * What it does:
 *   1. Ensures a "Talk Canvas" house artist row exists (featured).
 *   2. For every distinct originals.artist text value, ensures a matching
 *      artist row exists (created not-featured — you curate afterwards).
 *   3. Sets originals.artist_id on every row still missing a link, matching
 *      on the artist text.
 *
 * Nothing is flattened: a piece attributed to "Ada Okoye" links to an
 * "Ada Okoye" row, not to the house.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db/index";
import { artists, originals } from "../lib/db/schema";
import { eq, isNull } from "drizzle-orm";

const HOUSE_NAME = "Talk Canvas";
const HOUSE_SLUG = "talk-canvas";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Find an artist by slug, or create one. Returns the row id.
 * `featured` only applies on creation; existing rows are left as-is.
 */
async function ensureArtist(
  name: string,
  slug: string,
  featured: boolean,
): Promise<number> {
  const [existing] = await db
    .select({ id: artists.id })
    .from(artists)
    .where(eq(artists.slug, slug))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(artists)
    .values({ name, slug, featured })
    .returning({ id: artists.id });
  console.log(
    `  + created artist "${name}" (${slug})${featured ? " [featured]" : ""}`,
  );
  return created.id;
}

async function main() {
  console.log("Backfilling artists…\n");

  // 1. House artist — always present, featured so it shows in Popular Artists.
  const houseId = await ensureArtist(HOUSE_NAME, HOUSE_SLUG, true);
  console.log(`House artist "${HOUSE_NAME}" → id ${houseId}\n`);

  // 2. Distinct artist text values across all originals.
  const rows = await db.select({ artist: originals.artist }).from(originals);

  const distinct = [
    ...new Set(rows.map((r) => r.artist.trim()).filter(Boolean)),
  ];
  console.log(`Found ${distinct.length} distinct artist value(s).`);

  // Map each distinct name → artist id (creating rows as needed).
  const nameToId = new Map<string, number>();
  nameToId.set(HOUSE_NAME, houseId);

  for (const name of distinct) {
    const slug = slugify(name);
    // If it collides with the house slug, it *is* the house artist.
    const id =
      slug === HOUSE_SLUG ? houseId : await ensureArtist(name, slug, false);
    nameToId.set(name, id);
  }

  // 3. Link every original that doesn't yet have an artist_id.
  const unlinked = await db
    .select({ id: originals.id, artist: originals.artist })
    .from(originals)
    .where(isNull(originals.artistId));

  console.log(`\nLinking ${unlinked.length} unlinked original(s)…`);

  let linked = 0;
  for (const row of unlinked) {
    const key = row.artist.trim();
    const artistId = nameToId.get(key);
    if (!artistId) {
      console.warn(
        `  ! no artist resolved for original ${row.id} ("${row.artist}") — skipped`,
      );
      continue;
    }
    await db
      .update(originals)
      .set({ artistId, updatedAt: new Date() })
      .where(eq(originals.id, row.id));
    linked++;
  }

  console.log(
    `\nDone. Linked ${linked} original(s). ${unlinked.length - linked} skipped.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
