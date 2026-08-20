import { db } from "@/lib/db";
import { archivePrints } from "@/lib/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
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

export type ArchiveRow = typeof archivePrints.$inferSelect;

/**
 * One panel of a set, trimmed to what a thumbnail strip and a large view need.
 * Deliberately not the whole row: this rides along with every set tile in the
 * feed, so it carries pixels and position and nothing else.
 */
export interface ArchiveSetPanel {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  setPosition: number;
}

/** A feed row, optionally carrying every panel of its set in hanging order. */
export type ArchiveFeedRow = ArchiveRow & { panels?: ArchiveSetPanel[] };

export interface ArchivePage {
  items: ArchiveFeedRow[];
  nextCursor: number | null;
}

/**
 * Sets are modelled on archive_prints itself rather than in a separate table,
 * because the public feed is cursor-paginated by id — interleaving two entity
 * types in one cursor feed is where this gets fragile.
 *
 * The piece at setPosition 1 is canonical: it represents the set in the grid,
 * and its category and visibility are the set's. Members 2..n are hidden from
 * the feed and inherit those values, which the admin mutations below enforce
 * so the two can't drift apart.
 */
const IS_FEED_VISIBLE = or(
  isNull(archivePrints.setId),
  eq(archivePrints.setPosition, 1),
);

export async function getArchivePage(
  cursor?: number,
  pageSize = PAGE_SIZE,
  category?: ArchiveCategory,
  orientation?: ArchiveOrientation,
  /** Restrict to sets — the /prints/sets feed. */
  setsOnly?: boolean,
): Promise<ArchivePage> {
  const conditions = [eq(archivePrints.isVisible, true), IS_FEED_VISIBLE];
  if (cursor) conditions.push(lt(archivePrints.id, cursor));
  if (category) conditions.push(eq(archivePrints.collection, category));
  if (orientation) {
    conditions.push(eq(archivePrints.orientation, orientation));
  }
  // Combined with IS_FEED_VISIBLE this yields one row per set, not one per
  // panel — the page shows sets, not the pieces inside them.
  if (setsOnly) conditions.push(isNotNull(archivePrints.setId));

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
 * Attach every panel to each set row in a page, in hanging order.
 *
 * The canonical-row feed tells a tile that a set has three pieces but not what
 * the other two look like, so a tile can only ever show one panel and a badge.
 * This fills that gap in one extra query for the whole page rather than one per
 * tile — on /prints/sets every row is a set, so per-tile fetching would mean
 * twenty-four round trips to draw one screen.
 *
 * Wrap any getArchivePage call whose grid should show panels:
 *
 *   const page = await withSetPanels(await getArchivePage(...));
 *
 * Pages that don't wrap keep working — `panels` is optional, and the tile falls
 * back to fetching the set when it's opened.
 */
export async function withSetPanels(page: ArchivePage): Promise<ArchivePage> {
  const setIds = Array.from(
    new Set(
      page.items
        .map((i) => i.setId)
        .filter((id): id is number => typeof id === "number"),
    ),
  );
  if (setIds.length === 0) return page;

  const rows = await db
    .select({
      id: archivePrints.id,
      setId: archivePrints.setId,
      imageUrl: archivePrints.imageUrl,
      imagePublicId: archivePrints.imagePublicId,
      width: archivePrints.width,
      height: archivePrints.height,
      setPosition: archivePrints.setPosition,
    })
    .from(archivePrints)
    .where(
      and(
        inArray(archivePrints.setId, setIds),
        eq(archivePrints.isVisible, true),
      ),
    )
    .orderBy(asc(archivePrints.setPosition));

  // Ascending across the whole result stays ascending within each group, so
  // pushing in order is enough — no per-set sort needed.
  const bySet = new Map<number, ArchiveSetPanel[]>();
  for (const r of rows) {
    if (r.setId === null) continue;
    const list = bySet.get(r.setId) ?? [];
    list.push({
      id: r.id,
      imageUrl: r.imageUrl,
      imagePublicId: r.imagePublicId,
      width: r.width,
      height: r.height,
      setPosition: r.setPosition ?? list.length + 1,
    });
    bySet.set(r.setId, list);
  }

  return {
    ...page,
    items: page.items.map((item) =>
      item.setId ? { ...item, panels: bySet.get(item.setId) ?? [] } : item,
    ),
  };
}

/**
 * Every piece of a set, in hanging order. The configurator needs all of them:
 * the customer picks one frame and size, and it applies to the whole set.
 */
export async function getArchiveSet(setId: number): Promise<ArchiveRow[]> {
  return db
    .select()
    .from(archivePrints)
    .where(eq(archivePrints.setId, setId))
    .orderBy(asc(archivePrints.setPosition));
}

/**
 * Counts for the filter bar. Only canonical rows are counted, so a set of
 * three reads as one item — matching what the customer actually sees.
 */
export async function getArchiveCategoryCounts(
  orientation?: ArchiveOrientation,
): Promise<Record<string, number>> {
  const conditions = [eq(archivePrints.isVisible, true), IS_FEED_VISIBLE];
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

/** Admin — everything regardless of visibility or set membership. */
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
      collection: category ?? DEFAULT_ARCHIVE_CATEGORY,
      orientation: deriveOrientation(input.width, input.height),
    })
    .returning();
  return row;
}

export async function setArchiveVisibility(id: number, isVisible: boolean) {
  const target = await getArchivePrint(id);
  if (!target) return null;

  // Hiding one piece of a set would leave the rest orderable without it, which
  // the gallery's all-or-nothing rule forbids. Visibility moves as a unit.
  if (target.setId) {
    await db
      .update(archivePrints)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(archivePrints.setId, target.setId));
    return { ...target, isVisible };
  }

  const [row] = await db
    .update(archivePrints)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(archivePrints.id, id))
    .returning();
  return row ?? null;
}

export async function deleteArchivePrint(id: number) {
  const target = await getArchivePrint(id);
  if (!target) return;

  // Deleting one panel of a triptych leaves an unsellable pair. The set goes
  // together or not at all.
  if (target.setId) {
    await db.delete(archivePrints).where(eq(archivePrints.setId, target.setId));
    return;
  }

  await db.delete(archivePrints).where(eq(archivePrints.id, id));
}

export async function setArchiveCategory(
  id: number,
  category: ArchiveCategory,
) {
  const target = await getArchivePrint(id);
  if (!target) return null;

  if (target.setId) {
    await db
      .update(archivePrints)
      .set({ collection: category, updatedAt: new Date() })
      .where(eq(archivePrints.setId, target.setId));
    return { ...target, collection: category };
  }

  const [row] = await db
    .update(archivePrints)
    .set({ collection: category, updatedAt: new Date() })
    .where(eq(archivePrints.id, id))
    .returning();
  return row ?? null;
}

/**
 * Group loose prints into a set, in the order given. The first id becomes the
 * canonical piece and lends the set its category and visibility.
 *
 * Mixed orientations are rejected: all pieces take one frame and one size, so a
 * portrait panel beside a landscape one can't be satisfied by a single
 * selection. Better to fail here than at checkout.
 */
export async function createArchiveSet(ids: number[]): Promise<number> {
  if (ids.length < 2) {
    throw new Error("A set needs at least two pieces");
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error("The same piece was listed twice");
  }

  const rows = await db
    .select()
    .from(archivePrints)
    .where(inArray(archivePrints.id, ids));

  if (rows.length !== ids.length) {
    throw new Error("Some pieces no longer exist");
  }
  if (rows.some((r) => r.setId)) {
    throw new Error("Some pieces already belong to a set");
  }
  if (new Set(rows.map((r) => r.orientation)).size > 1) {
    throw new Error(
      "All pieces in a set must share the same orientation — they take one frame and size",
    );
  }

  // The canonical piece's own id doubles as the set id: already unique, and it
  // makes a set easy to identify in orders and support conversations.
  const setId = ids[0];
  const setSize = ids.length;
  const canonical = rows.find((r) => r.id === setId)!;

  // Neon's HTTP driver has no transactions, so these land one at a time.
  // Position 1 is written last: until it exists, IS_FEED_VISIBLE matches none
  // of these rows, so a half-applied grouping hides the pieces rather than
  // putting a partial set on sale.
  for (let i = 1; i < ids.length; i++) {
    await db
      .update(archivePrints)
      .set({
        setId,
        setPosition: i + 1,
        setSize,
        collection: canonical.collection,
        isVisible: canonical.isVisible,
        updatedAt: new Date(),
      })
      .where(eq(archivePrints.id, ids[i]));
  }

  await db
    .update(archivePrints)
    .set({ setId, setPosition: 1, setSize, updatedAt: new Date() })
    .where(eq(archivePrints.id, setId));

  return setId;
}

/** Break a set back into loose prints. */
export async function dissolveArchiveSet(setId: number) {
  await db
    .update(archivePrints)
    .set({
      setId: null,
      setPosition: null,
      setSize: null,
      updatedAt: new Date(),
    })
    .where(eq(archivePrints.setId, setId));
}
