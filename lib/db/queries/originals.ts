import { db } from "../index";
import { originals, type Original, type NewOriginal } from "../schema";
import { eq, asc, desc } from "drizzle-orm";
import { inArray, isNull, isNotNull } from "drizzle-orm";

/**
 * Used to validate cart items at checkout — fetch all referenced originals
 * in one query so the API can verify they still exist and aren't sold.
 */
export async function getOriginalsByIds(ids: number[]): Promise<Original[]> {
  if (ids.length === 0) return [];
  return await db.select().from(originals).where(inArray(originals.id, ids));
}

/**
 * Mark an original as sold. Called after an order is successfully created.
 */
export async function markOriginalSold(id: number): Promise<void> {
  await db
    .update(originals)
    .set({ soldAt: new Date(), updatedAt: new Date() })
    .where(eq(originals.id, id));
}

/**
 * Reverse the sold flag — used by admin in case of cancelled order or
 * an accidental mark.
 */
export async function markOriginalAvailable(id: number): Promise<void> {
  await db
    .update(originals)
    .set({ soldAt: null, updatedAt: new Date() })
    .where(eq(originals.id, id));
}

/**
 * Available-only listing — useful for the home page featured grid
 * where we want to highlight pieces customers can still buy.
 * The /originals page itself will keep showing sold pieces with a badge
 * (gallery convention — sold pieces are social proof).
 */
export async function getAvailableOriginals(): Promise<Original[]> {
  return await db
    .select()
    .from(originals)
    .where(isNull(originals.soldAt))
    .orderBy(originals.displayOrder);
}

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
