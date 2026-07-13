/**
 * scripts/backfill-orientation.ts
 *
 * Populates archive_prints.orientation from each row's existing width/height.
 * Nothing is tagged by hand — orientation is a fact about the image.
 *
 * Run AFTER `drizzle-kit generate` + `drizzle-kit migrate` add the column
 * (which defaults every existing row to "portrait"):
 *
 *   npx tsx --env-file=.env.local scripts/backfill-orientation.ts
 *
 * Idempotent — safe to re-run.
 */

import { db } from "../lib/db/index";
import { archivePrints } from "../lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Backfilling archive orientation…\n");

  // Landscape = wider than tall. Everything else (incl. squares) stays portrait,
  // which is already the column default.
  const updated = await db
    .update(archivePrints)
    .set({ orientation: "landscape", updatedAt: new Date() })
    .where(sql`${archivePrints.width} > ${archivePrints.height}`)
    .returning({ id: archivePrints.id });

  console.log(`Marked ${updated.length} print(s) as landscape.`);
  console.log("All others remain portrait.\n");
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
