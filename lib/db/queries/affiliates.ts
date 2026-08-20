import { db } from "../index";
import {
  affiliates,
  orders,
  type Affiliate,
  type NewAffiliate,
  type Order,
} from "../schema";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { randomBytes } from "crypto";

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

/**
 * The stats token IS the credential for an influencer's private page — there
 * are no influencer logins. 32 random bytes (~256 bits) as hex: not guessable,
 * not enumerable.
 */
export function generateStatsToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Look up an affiliate by their private stats token. Only ever matches
 * "affiliate" rows — a promo code has no influencer and no stats page.
 */
export async function getAffiliateByStatsToken(
  token: string,
): Promise<Affiliate | undefined> {
  if (!token || token.length < 32) return undefined;
  const [row] = await db
    .select()
    .from(affiliates)
    .where(
      and(eq(affiliates.statsToken, token), eq(affiliates.kind, "affiliate")),
    )
    .limit(1);
  return row;
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
        eq(orders.paymentStatus, "paid"),
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

/** Influencer codes only — excludes site promos like the first-visit offer. */
export async function getAffiliatesByKind(
  kind: "affiliate" | "promo",
): Promise<Affiliate[]> {
  return await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.kind, kind))
    .orderBy(desc(affiliates.isActive), desc(affiliates.id));
}

/**
 * The active site-wide promo, if any — powers the first-visit pop-up. If the
 * gallery has several, the most recently created live one wins.
 */
export async function getActivePromo(): Promise<Affiliate | undefined> {
  const rows = await db
    .select()
    .from(affiliates)
    .where(and(eq(affiliates.kind, "promo"), eq(affiliates.isActive, true)))
    .orderBy(desc(affiliates.id));

  return rows.find(
    (p) => !p.expiresAt || new Date(p.expiresAt).getTime() > Date.now(),
  );
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
  const kind = data.kind ?? "affiliate";
  const [created] = await db
    .insert(affiliates)
    .values({
      ...data,
      kind,
      code: normalizeCode(data.code),
      // Influencers get a private stats link; promos don't.
      statsToken:
        kind === "affiliate" ? (data.statsToken ?? generateStatsToken()) : null,
    })
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
