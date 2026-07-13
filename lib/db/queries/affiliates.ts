import { db } from "../index";
import {
  affiliates,
  orders,
  type Affiliate,
  type NewAffiliate,
  type Order,
} from "../schema";
import { eq, and, sql, desc, count } from "drizzle-orm";

/** Why a code was rejected — surfaced to the customer at checkout. */
export type CodeRejection =
  | "not_found"
  | "inactive"
  | "expired"
  | "already_used";

export type CodeCheck =
  | { ok: true; affiliate: Affiliate }
  | { ok: false; reason: CodeRejection };

/** Codes are stored uppercase; user input is normalized before lookup. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function getAffiliateByCode(
  code: string,
): Promise<Affiliate | undefined> {
  const [row] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.code, normalizeCode(code)))
    .limit(1);
  return row;
}

/**
 * Has this email already used this code? There are no accounts on the site, so
 * the order email is the only customer identifier available. Case-insensitive.
 */
export async function hasEmailUsedCode(
  affiliateId: number,
  email: string,
): Promise<boolean> {
  const [row] = await db
    .select({ n: count() })
    .from(orders)
    .where(
      and(
        eq(orders.affiliateId, affiliateId),
        sql`lower(${orders.customerEmail}) = ${email.trim().toLowerCase()}`,
      ),
    );
  return (row?.n ?? 0) > 0;
}

/**
 * Full server-side validation. `email` is optional so the checkout page can
 * preview a code before the customer has typed their address; the final check
 * at order time always passes it.
 */
export async function checkCode(
  code: string,
  email?: string,
): Promise<CodeCheck> {
  const affiliate = await getAffiliateByCode(code);
  if (!affiliate) return { ok: false, reason: "not_found" };
  if (!affiliate.isActive) return { ok: false, reason: "inactive" };
  if (affiliate.expiresAt && affiliate.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (email && (await hasEmailUsedCode(affiliate.id, email))) {
    return { ok: false, reason: "already_used" };
  }
  return { ok: true, affiliate };
}

// ── ADMIN ────────────────────────────────────────────────────────

export async function getAllAffiliates(): Promise<Affiliate[]> {
  return await db
    .select()
    .from(affiliates)
    .orderBy(desc(affiliates.isActive), desc(affiliates.id));
}

export async function getAffiliateById(
  id: number,
): Promise<Affiliate | undefined> {
  const [row] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, id))
    .limit(1);
  return row;
}

export async function createAffiliate(data: NewAffiliate): Promise<Affiliate> {
  const [created] = await db
    .insert(affiliates)
    .values({ ...data, code: normalizeCode(data.code) })
    .returning();
  return created;
}

export async function updateAffiliate(
  id: number,
  data: Partial<NewAffiliate>,
): Promise<Affiliate | undefined> {
  const [updated] = await db
    .update(affiliates)
    .set({
      ...data,
      ...(data.code ? { code: normalizeCode(data.code) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(affiliates.id, id))
    .returning();
  return updated;
}

export async function deleteAffiliate(id: number): Promise<void> {
  // orders.affiliateId is onDelete "set null" — past orders keep their
  // affiliateCode/discountAmount snapshot even if the affiliate is removed.
  await db.delete(affiliates).where(eq(affiliates.id, id));
}

// ── RECONCILIATION ───────────────────────────────────────────────

export interface AffiliateStats {
  orderCount: number;
  grossSales: number; // what customers actually paid, excl. shipping
  totalDiscount: number; // naira given away via this code
}

/** Orders placed with a given code, newest first — the settlement list. */
export async function getOrdersByAffiliate(
  affiliateId: number,
): Promise<Order[]> {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.affiliateId, affiliateId))
    .orderBy(desc(orders.createdAt));
}

export function summarizeAffiliateOrders(rows: Order[]): AffiliateStats {
  return rows.reduce<AffiliateStats>(
    (acc, o) => ({
      orderCount: acc.orderCount + 1,
      grossSales: acc.grossSales + (o.subtotal - o.discountAmount),
      totalDiscount: acc.totalDiscount + o.discountAmount,
    }),
    { orderCount: 0, grossSales: 0, totalDiscount: 0 },
  );
}
