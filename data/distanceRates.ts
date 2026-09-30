/**
 * Delivery by distance — the gallery's rules.
 *
 * One company van, ₦300 per km whatever the size. Every piece falls into a tier:
 *   small      — van, +₦3,500 when the order has more than 10 pieces
 *   large      — van, +₦5,000 when the order has more than 10 pieces
 *   outsourced — too big for the van; a third-party courier is booked and
 *                the whole order is quoted after it's placed
 * Sets follow the same rules; each panel counts as a piece.
 * Outside Lagos goes through GIG Logistics and is quoted after the order.
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

export const TIER_LABELS: Record<DeliveryTier, string> = {
  small: "Van (small sizes)",
  large: "Van (large sizes)",
  outsourced: "Third-party courier",
};

export const OUTSIDE_LAGOS_GIG_NOTE =
  "Deliveries outside Lagos are sent through GIG Logistics. We'll confirm the cost with you after you order — nothing is charged for delivery now.";

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
