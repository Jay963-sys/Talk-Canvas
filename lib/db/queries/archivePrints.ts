import { db } from "@/lib/db";
import { archivePrints } from "@/lib/db/schema";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import {
  DEFAULT_ARCHIVE_CATEGORY,
  type ArchiveCategory,
} from "@/data/collections";

const PAGE_SIZE = 24;

export type ArchiveOrientation = "portrait" | "landscape";

/** Derived from the image itself — never a manual tag. Squares read portrait. */
export function deriveOrientation(
  width: number,
  height: number,
): ArchiveOrientation {
  return width > height ? "landscape" : "portrait";
}

export interface ArchivePage {
  items: (typeof archivePrints.$inferSelect)[];
  nextCursor: number | null;
}

/**
 * Public grid feed — visible only, newest first, cursor-paginated by id.
 *
 * Category and orientation are independent filters and combine freely: passing
 * both narrows to designs that are in that category *and* that shape. Neither
 * one nests inside the other.
 */
export async function getArchivePage(
  cursor?: number,
  pageSize = PAGE_SIZE,
  category?: ArchiveCategory,
  orientation?: ArchiveOrientation,
): Promise<ArchivePage> {
  const conditions = [eq(archivePrints.isVisible, true)];
  if (cursor) conditions.push(lt(archivePrints.id, cursor));
  if (category) conditions.push(eq(archivePrints.collection, category));
  if (orientation) {
    conditions.push(eq(archivePrints.orientation, orientation));
  }

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

/**
 * How many visible designs sit in each category, optionally within one
 * orientation. Used to dim categories the gallery hasn't filled yet, so an
 * empty tab reads as "nothing here yet" rather than as a broken filter.
 */
export async function getArchiveCategoryCounts(
  orientation?: ArchiveOrientation,
): Promise<Record<string, number>> {
  const conditions = [eq(archivePrints.isVisible, true)];
  if (orientation) {
    conditions.push(eq(archivePrints.orientation, orientation));
  }

  const rows = await db
    .select({
      category: archivePrints.collection,
      count: sql<number>`count(*)::int`,
    })
    .from(archivePrints)
    .where(and(...conditions))
    .groupBy(archivePrints.collection);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = row.category ?? DEFAULT_ARCHIVE_CATEGORY;
    counts[key] = (counts[key] ?? 0) + row.count;
  }
  return counts;
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
  category?: ArchiveCategory;
}) {
  const { category, ...rest } = input;

  const [row] = await db
    .insert(archivePrints)
    .values({
      ...rest,
      // Categories are chosen at upload; anything unset lands in Others rather
      // than dropping out of every filtered view.
      collection: category ?? DEFAULT_ARCHIVE_CATEGORY,
      // Set automatically — the admin never picks this.
      orientation: deriveOrientation(input.width, input.height),
    })
    .returning();
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

/** Recategorize a single design from the admin grid. */
export async function setArchiveCategory(
  id: number,
  category: ArchiveCategory,
) {
  const [row] = await db
    .update(archivePrints)
    .set({ collection: category, updatedAt: new Date() })
    .where(eq(archivePrints.id, id))
    .returning();
  return row ?? null;
}
