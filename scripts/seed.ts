import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../lib/db";
import { originals } from "../lib/db/schema";
import { ORIGINALS } from "../data/originals";

async function seed() {
  console.log(`Seeding ${ORIGINALS.length} originals...`);

  for (let i = 0; i < ORIGINALS.length; i++) {
    const o = ORIGINALS[i];
    await db
      .insert(originals)
      .values({
        slug: o.id,
        title: o.title,
        artist: o.artist,
        year: o.year,
        medium: o.medium,
        size: o.size,
        price: o.price,
        imageUrl: o.img,
        description: o.description,
        displayOrder: i,
      })
      .onConflictDoNothing(); // safe to re-run
  }

  console.log("✓ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
