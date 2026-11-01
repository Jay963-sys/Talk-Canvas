import { db } from "@/lib/db";
import { arModels } from "@/lib/db/schema";
import { eq, lt } from "drizzle-orm";

export async function getArModel(cacheKey: string) {
  const [row] = await db
    .select({ glbUrl: arModels.glbUrl, usdzUrl: arModels.usdzUrl })
    .from(arModels)
    .where(eq(arModels.cacheKey, cacheKey))
    .limit(1);
  return row ?? null;
}

export async function upsertArModel(input: {
  cacheKey: string;
  glbUrl: string;
  usdzUrl: string | null;
}) {
  // Last write wins — concurrent misses produce equivalent models, and a later
  // run that succeeds at USDZ can fill in a previously-null usdzUrl.
  await db
    .insert(arModels)
    .values(input)
    .onConflictDoUpdate({
      target: arModels.cacheKey,
      set: { glbUrl: input.glbUrl, usdzUrl: input.usdzUrl },
    });
}

/**
 * Forget cached models created before `before`. Run BEFORE their files are
 * deleted from Cloudinary, so the cache never points at a missing file — the
 * next AR view of that piece simply generates a fresh model.
 */
export async function deleteArModelsCreatedBefore(before: Date): Promise<number> {
  const rows = await db
    .delete(arModels)
    .where(lt(arModels.createdAt, before))
    .returning({ id: arModels.id });
  return rows.length;
}
