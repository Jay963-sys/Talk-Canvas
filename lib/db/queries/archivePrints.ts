import { db } from "@/lib/db";
import { archivePrints } from "@/lib/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

const PAGE_SIZE = 24;

export interface ArchivePage {
  items: (typeof archivePrints.$inferSelect)[];
  nextCursor: number | null;
}

/**
 * Public grid feed — visible only, newest first, cursor-paginated by id.
 * Cursor is the id of the last item already seen; we fetch ids below it.
 */
export async function getArchivePage(
  cursor?: number,
  pageSize = PAGE_SIZE,
): Promise<ArchivePage> {
  const where = cursor
    ? and(eq(archivePrints.isVisible, true), lt(archivePrints.id, cursor))
    : eq(archivePrints.isVisible, true);

  // Fetch one extra to know whether another page exists.
  const rows = await db
    .select()
    .from(archivePrints)
    .where(where)
    .orderBy(desc(archivePrints.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
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
