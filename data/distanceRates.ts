/**
 * Delivery by distance — the gallery's rules.
 *
 * One company van, ₦300 per km whatever the size. Every piece falls into a tier:
 *   small      — van, +₦3,500 when the order has more than 10 pieces
 *   large      — van, +₦5,000 when the order has more than 10 pieces
 *   outsourced — too big for the van; a third-party courier is booked and
 *                the whole order is quoted after it's placed
 * Sets follow the same rules; each panel counts as a piece.
 *
 * Outside Lagos is a different model: GIG Logistics, one price list for the
 * whole country, by size (see the GIG section below).
 */

/** Stored as the order's deliveryZone when the fee came from distance. */
export const LAGOS_DISTANCE_ZONE_ID = "lagos-distance";

export type DeliveryTier = "small" | "large" | "outsourced";

/** Van rate, same for every size the van can carry. */
export const PER_KM = 300;

/** Added when an order has more than BULK_THRESHOLD pieces. */
export const BULK_SURCHARGE: Record<
  Exclude<DeliveryTier, "outsourced">,
  number
> = {
  small: 3500,
  large: 5000,
};

/** More pieces than this adds the tier's bulk surcharge. */
export const BULK_THRESHOLD = 10;

/** No minimum fee (the gallery's decision). Raise this to add a floor later. */
export const MINIMUM_FEE = 0;

/**
 * Longer routes inside Lagos go to a manual quote. Mostly a guard against a
 * bad geocode producing an absurd fee; Abule Egba to Epe is roughly 100 km.
 */
export const MAX_AUTO_QUOTE_KM = 130;

export const TIER_LABELS: Record<DeliveryTier | `gig_${GigTier}`, string> = {
  small: "Van (small sizes)",
  large: "Van (large sizes)",
  outsourced: "Third-party courier",
  gig_small: "GIG Logistics (small)",
  gig_medium: "GIG Logistics (medium)",
  gig_large: "GIG Logistics (large)",
  gig_xl: "GIG Logistics (extra large)",
};

export const EXTRA_LARGE_NOTE =
  "Your order includes an extra-large piece, which we quote individually for delivery by GIG Logistics. We'll confirm the cost with you after you order — nothing is charged for delivery now.";

export const OUTSOURCED_NOTE =
  "Your order includes a piece too large for our van, so it goes with a third-party courier. We'll confirm the delivery cost with you after you order — nothing is charged for delivery now.";

/**
 * Tier from a piece's dimensions, either orientation. Reproduces the
 * gallery's size lists exactly:
 *   small:      short side ≤ 30 and long side ≤ 48   (12×16 … 30×40, 24×48)
 *   large:      anything else under 50 on the short side (30×50 … 48×84)
 *   outsourced: short side ≥ 50                       (50×90 … 84×84)
 */
export function tierForInches(w: number, h: number): DeliveryTier {
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  if (short >= 50) return "outsourced";
  if (short > 30 || long > 48) return "large";
  return "small";
}

/** Fee for an order the van can carry. The largest piece sets the tier. */
export function distanceFee(
  tier: Exclude<DeliveryTier, "outsourced">,
  km: number,
  pieces: number,
): { fee: number; surcharge: number } {
  const surcharge = pieces > BULK_THRESHOLD ? BULK_SURCHARGE[tier] : 0;
  const distancePart = Math.ceil((km * PER_KM) / 100) * 100; // round up to ₦100
  return { fee: Math.max(MINIMUM_FEE, distancePart + surcharge), surcharge };
}

// ───────────────────────── Outside Lagos (GIG Logistics) ─────────────────────────
//
// One price list for the whole country, by size (the gallery's tested model).
//   base      = the average price of the LARGEST size in the order
//   each other frame adds its OWN category's "subsequent" rate
//   extra large sizes are quoted by hand, then paid as a part payment
// No 10-piece surcharge here — the per-frame charge replaces it.
//
// Worked example (the gallery's): 5 × 50×90, 4 × 48×72, 3 × 16×16
//   20,000 + (4 × 5,000) + (4 × 5,000) + (3 × 2,500) = 67,500

export type GigTier = "small" | "medium" | "large" | "xl";

/** Lowest to highest. The order's largest tier sets its base price. */
export const GIG_TIER_ORDER: readonly GigTier[] = [
  "small",
  "medium",
  "large",
  "xl",
];

export const GIG_BASE: Record<Exclude<GigTier, "xl">, number> = {
  small: 12750,
  medium: 15000,
  large: 20000,
};

export const GIG_SUBSEQUENT: Record<Exclude<GigTier, "xl">, number> = {
  small: 2500,
  medium: 3500,
  large: 5000,
};

/** The gallery's size list (October 2026), short side first. */
const GIG_SIZES: { tier: GigTier; w: number; h: number }[] = [
  ...(
    [
      [12, 16],
      [16, 16],
      [16, 20],
      [18, 24],
      [20, 30],
      [20, 40],
      [24, 36],
    ] as const
  ).map(([w, h]) => ({ tier: "small" as const, w, h })),
  ...(
    [
      [24, 48],
      [30, 40],
      [30, 50],
      [36, 48],
      [30, 60],
      [48, 48],
    ] as const
  ).map(([w, h]) => ({ tier: "medium" as const, w, h })),
  ...(
    [
      [40, 60],
      [40, 70],
      [40, 80],
      [48, 72],
      [48, 84],
      [50, 90],
    ] as const
  ).map(([w, h]) => ({ tier: "large" as const, w, h })),
  ...(
    [
      [60, 60],
      [60, 72],
      [60, 84],
      [72, 72],
      [60, 90],
      [72, 96],
      [84, 84],
    ] as const
  ).map(([w, h]) => ({ tier: "xl" as const, w, h })),
];

/** Width + height rounded to the nearest 10; a last digit of 5 rounds up. */
const roundedSum = (w: number, h: number) => Math.floor((w + h + 5) / 10) * 10;

const rankOf = (t: GigTier) => GIG_TIER_ORDER.indexOf(t);

/**
 * Size tier for GIG delivery, either orientation.
 *
 * 1. A size on the list is priced as listed.
 * 2. Anything else (custom sizes, odd originals) is fitted the gallery's way:
 *    add width + height, round to the nearest 10, and take the listed sizes
 *    with the same rounded total. e.g. 28×35 = 63 → 60 → 20×40; 36×36 = 72 →
 *    70 → 24×48.
 *    - If listed sizes at that total sit in different tiers (e.g. 100, 120),
 *      the HIGHER tier wins — never undercharge a delivery we pay GIG for.
 *    - Below the smallest listed total → small. Above the largest → extra large.
 */
export function gigTierForInches(w: number, h: number): GigTier {
  const short = Math.min(w, h);
  const long = Math.max(w, h);

  const exact = GIG_SIZES.find(
    (s) => Math.abs(s.w - short) < 0.01 && Math.abs(s.h - long) < 0.01,
  );
  if (exact) return exact.tier;

  const target = roundedSum(short, long);
  const matches = GIG_SIZES.filter((s) => roundedSum(s.w, s.h) === target);
  if (matches.length > 0) {
    return matches.reduce<GigTier>(
      (top, s) => (rankOf(s.tier) > rankOf(top) ? s.tier : top),
      "small",
    );
  }

  const totals = GIG_SIZES.map((s) => roundedSum(s.w, s.h));
  return target < Math.min(...totals) ? "small" : "xl";
}
