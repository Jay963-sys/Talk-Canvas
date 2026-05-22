import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../lib/db";
import { originals } from "../lib/db/schema";
import { ORIGINALS } from "../data/originals";

async function seed() {
  console.log(`Seeding ${ORIGINALS.length} originals...`);

  for (let i = 0; i < ORIGINALS.length; i++) {
    const o = ORIGINALS[i];

    // Safely extract dimensions if o.size is a string like "24x36" or "24 x 36 inches"
    let width = 24;
    let height = 36;
    if (typeof o.size === "string") {
      const matches = o.size.match(/(\d+)(\.\d+)?/g);
      if (matches && matches.length >= 2) {
        width = parseFloat(matches[0]);
        height = parseFloat(matches[1]);
      }
    }

    // Clean up price in case it has commas or currency symbols
    const cleanPrice =
      typeof o.price === "string"
        ? parseInt(o.price.replace(/[^0-9]/g, ""))
        : o.price;

    await db
      .insert(originals)
      .values({
        slug: o.id,
        title: o.title,
        artist: o.artist,
        year: Number(o.year),
        medium: o.medium,

        // New Dimension Fields
        widthInches: width,
        heightInches: height,

        // Enforced Integer Price
        price: cleanPrice || 0,

        imageUrl: o.img,
        description: o.description,

        // New Frame Fields (Applying gallery defaults for seeded items)
        frameStyle: "regular",
        frameShape: "floating",
        frameColor: "black",
        glass: false,

        displayOrder: i,
        isVisible: true,
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
