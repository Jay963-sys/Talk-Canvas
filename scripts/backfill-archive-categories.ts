/**
 * Backfill archive categories.
 *
 * Every archive print already has a `collection` column — that's the field the
 * new category system reuses, so there is no migration. What this does is
 * normalize whatever is in there today onto the approved slugs, and park
 * anything unrecognized (including NULLs) in "others" so no design falls out of
 * every filtered view the moment categories go live.
 *
 * Safe to run more than once.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-archive-categories.ts
 *
 * Add a `--dry` flag to print the plan without writing.
 */

import { db } from "@/lib/db";
import { archivePrints } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  DEFAULT_ARCHIVE_CATEGORY,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";

/**
 * Old free-text collection names → new slugs. Add a line here for any legacy
 * value worth preserving; everything else lands in "others" for staff to
 * recategorize from the admin grid.
 */
const LEGACY_MAP: Record<string, ArchiveCategory> = {
  // "Abstracts": "abstract",
  // "Black & White": "monochrome",
  // "Afro": "afrocentric",
};

function normalize(value: string | null): ArchiveCategory {
  if (!value) return DEFAULT_ARCHIVE_CATEGORY;

  const trimmed = value.trim();
  if (isArchiveCategory(trimmed)) return trimmed;

  const mapped = LEGACY_MAP[trimmed];
  if (mapped) return mapped;

  // Tolerate a display label that was stored instead of a slug.
  const slugified = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (isArchiveCategory(slugified)) return slugified;

  return DEFAULT_ARCHIVE_CATEGORY;
}

async function main() {
  const dry = process.argv.includes("--dry");

  const rows = await db
    .select({ id: archivePrints.id, collection: archivePrints.collection })
    .from(archivePrints);

  const changes = rows
    .map((row) => ({ id: row.id, from: row.collection, to: normalize(row.collection) }))
    .filter((c) => c.from !== c.to);

  console.log(`${rows.length} archive prints, ${changes.length} to update.`);

  const tally = new Map<string, number>();
  for (const c of changes) tally.set(c.to, (tally.get(c.to) ?? 0) + 1);
  for (const [slug, n] of tally) console.log(`  → ${slug}: ${n}`);

  if (dry) {
    console.log("Dry run — nothing written.");
    return;
  }

  // The Neon HTTP driver has no transactions, so these go one at a time. The
  // operation is idempotent, so a partial run is safe to re-run.
  for (const c of changes) {
    await db
      .update(archivePrints)
      .set({ collection: c.to, updatedAt: new Date() })
      .where(eq(archivePrints.id, c.id));
  }

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
