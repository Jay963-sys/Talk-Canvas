import { db } from "../index";
import { originals, type Original, type NewOriginal } from "../schema";
import { eq, asc, desc } from "drizzle-orm";

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
