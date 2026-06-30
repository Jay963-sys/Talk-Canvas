import { db } from "@/lib/db";
import { archivePrints } from "@/lib/db/schema";
import { and, desc, eq, lt, isNotNull } from "drizzle-orm";

const PAGE_SIZE = 24;

export interface ArchivePage {
  items: (typeof archivePrints.$inferSelect)[];
  nextCursor: number | null;
}

/**
 * Public grid feed — visible only, newest first, cursor-paginated by id.
 * Optionally scoped to a single collection.
 */
export async function getArchivePage(
  cursor?: number,
  pageSize = PAGE_SIZE,
  collection?: string,
): Promise<ArchivePage> {
  const conditions = [eq(archivePrints.isVisible, true)];
  if (cursor) conditions.push(lt(archivePrints.id, cursor));
  if (collection) conditions.push(eq(archivePrints.collection, collection));

  const rows = await db
    .select()
    .from(archivePrints)
    .where(and(...conditions))
    .orderBy(desc(archivePrints.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

/** Distinct collection names currently in use, for building the filter UI. */
export async function getArchiveCollections(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ collection: archivePrints.collection })
    .from(archivePrints)
    .where(
      and(
        eq(archivePrints.isVisible, true),
        isNotNull(archivePrints.collection),
      ),
    );
  return rows.map((r) => r.collection as string).sort();
}

export async function getArchivePrint(id: number) {
  const [row] = await db
    .select()
    .from(archivePrints)
    .where(eq(archivePrints.id, id))
    .limit(1);
  return row ?? null;
}

/** Admin — everything regardless of visibility, newest first. */
export async function getAllArchivePrints() {
  return db.select().from(archivePrints).orderBy(desc(archivePrints.id));
}

export async function createArchivePrint(input: {
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  collection?: string;
}) {
  const [row] = await db.insert(archivePrints).values(input).returning();
  return row;
}

export async function setArchiveVisibility(id: number, isVisible: boolean) {
  const [row] = await db
    .update(archivePrints)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(archivePrints.id, id))
    .returning();
  return row ?? null;
}

export async function deleteArchivePrint(id: number) {
  await db.delete(archivePrints).where(eq(archivePrints.id, id));
}

export async function setArchiveCollection(
  id: number,
  collection: string | null,
) {
  const [row] = await db
    .update(archivePrints)
    .set({ collection, updatedAt: new Date() })
    .where(eq(archivePrints.id, id))
    .returning();
  return row ?? null;
}
