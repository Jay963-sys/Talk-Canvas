/**
 * scripts/backfill-one-of-one.ts
 *
 * Sets the oneOfOne flag on existing originals now that recreatable house
 * designs and one-of-one artist works are distinguished explicitly.
 *
 * Run AFTER `drizzle-kit generate` + `drizzle-kit migrate` have added the
 * one_of_one column (defaults to false):
 *
 *   npx tsx scripts/backfill-one-of-one.ts
 *
 * Rules:
 *   - Works linked to a real (non-house) artist  → oneOfOne = true
 *   - House "Talk Canvas" works and unlinked rows → oneOfOne = false (default)
 *   - Any house/unlinked row that was wrongly marked sold gets soldAt cleared,
 *     since recreatable designs never sell out.
 *
 * Idempotent — safe to re-run.
 */

import { db } from "../lib/db/index";
import { originals, artists } from "../lib/db/schema";
import { and, eq, ne, isNotNull, isNull, or } from "drizzle-orm";
import { HOUSE_ARTIST_SLUG } from "../lib/constants";

async function main() {
  console.log("Backfilling oneOfOne…\n");

  const [house] = await db
    .select({ id: artists.id })
    .from(artists)
    .where(eq(artists.slug, HOUSE_ARTIST_SLUG))
    .limit(1);

  if (!house) {
    console.error(
      `No "${HOUSE_ARTIST_SLUG}" artist found. Run backfill-artists.ts first.`,
    );
    process.exit(1);
  }

  // 1. Mark every work linked to a NON-house artist as one-of-one.
  const oneOfOneRes = await db
    .update(originals)
    .set({ oneOfOne: true, updatedAt: new Date() })
    .where(and(isNotNull(originals.artistId), ne(originals.artistId, house.id)))
    .returning({ id: originals.id });

  console.log(`Marked ${oneOfOneRes.length} artist work(s) as one-of-one.`);

  // 2. Recreatable house / unlinked rows: ensure not one-of-one AND not stuck
  //    "sold" from the earlier one-of-one-everything behaviour.
  const houseRes = await db
    .update(originals)
    .set({ oneOfOne: false, soldAt: null, updatedAt: new Date() })
    .where(or(eq(originals.artistId, house.id), isNull(originals.artistId)))
    .returning({ id: originals.id });

  console.log(
    `Reset ${houseRes.length} house/unlinked design(s) to recreatable (soldAt cleared).`,
  );

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
