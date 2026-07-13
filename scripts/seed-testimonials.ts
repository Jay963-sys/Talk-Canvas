/**
 * scripts/seed-testimonials.ts
 *
 * Moves the three previously-hardcoded testimonials into the database so the
 * site doesn't go blank the moment Testimonials.tsx starts reading from the DB.
 * The gallery can then edit, reorder, add wall photos, or delete them freely.
 *
 *   npx tsx --env-file=.env.local scripts/seed-testimonials.ts
 *
 * Idempotent — skips any quote that's already present.
 */

import { db } from "../lib/db/index";
import { testimonials } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const SEED = [
  {
    quote:
      "I wasn't sure how the piece would feel in person — the AR preview meant there were no surprises when it arrived.",
    name: "Folake A.",
    location: "Lagos",
    displayOrder: 0,
  },
  {
    quote:
      "Ordered a print of an archive piece I'd been eyeing for weeks. Framed and on the wall within days.",
    name: "Daniel O.",
    location: "Abuja",
    displayOrder: 1,
  },
  {
    quote:
      "Bought an original after months of following the gallery. It's the first thing people ask about when they visit.",
    name: "Chiamaka N.",
    location: "London",
    displayOrder: 2,
  },
];

async function main() {
  console.log("Seeding testimonials…\n");
  let added = 0;

  for (const t of SEED) {
    const [existing] = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(eq(testimonials.name, t.name))
      .limit(1);

    if (existing) {
      console.log(`  = "${t.name}" already present — skipped`);
      continue;
    }

    await db.insert(testimonials).values({ ...t, rating: 5, isVisible: true });
    console.log(`  + added "${t.name}"`);
    added++;
  }

  console.log(`\nDone. Added ${added} testimonial(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
