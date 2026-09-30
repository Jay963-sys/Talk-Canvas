import {
  bandForInches,
  vehicleFor,
  deliveryFee,
  OUTSIDE_LAGOS_ID,
  type SizeBand,
  type Vehicle,
} from "@/data/delivery";
import {
  distanceFee,
  MAX_AUTO_QUOTE_KM,
  tierForInches,
  type DeliveryTier,
} from "@/data/distanceRates";
import { getSize } from "@/data/sizes";

/** Minimal shape both the cart and the server can produce. */
export interface DeliverablePiece {
  /** Print items: the size id from the catalogue. */
  sizeId?: string | null;
  /** Original items: their true dimensions, stored per piece. */
  widthInches?: number | null;
  heightInches?: number | null;
  quantity: number;
  /**
   * Panels this entry stands for, beyond what `quantity` already covers.
   *
   * The cart holds a set as ONE line, so a triptych there is setSize 3. The
   * order route expands that same set into three rows before quoting, so each
   * row is setSize 1 — the panels are already counted by then. Getting this
   * wrong double-counts and oversizes the vehicle, hence the two separate
   * fields below rather than one clever one.
   */
  setSize?: number | null;
  /**
   * True if this entry belongs to a set, whatever its setSize. Drives the
   * quote path, which both callers need regardless of how they count panels.
   */
  isSet?: boolean;
}

function bandFor(p: DeliverablePiece): SizeBand | null {
  if (p.sizeId) {
    const s = getSize(p.sizeId);
    if (!s) return null;
    return bandForInches(s.inches.w, s.inches.h);
  }
  if (p.widthInches && p.heightInches) {
    return bandForInches(p.widthInches, p.heightInches);
  }
  return null;
}

export interface DeliveryQuote {
  vehicle: Vehicle;
  fee: number;
  /** True when the fee can't be computed up front and will be quoted later. */
  quoteOnRequest: boolean;
  /** Driving km from the studio, when the quote came from distance. */
  km?: number | null;
}

/** Vehicle and set detection, shared by both quote paths so they can't drift. */
function assess(pieces: DeliverablePiece[]) {
  const totalPieces = pieces.reduce(
    (n, p) => n + (p.quantity || 1) * Math.max(1, p.setSize ?? 1),
    0,
  );
  const bands = pieces.map(bandFor).filter((b): b is SizeBand => b !== null);
  return {
    vehicle: vehicleFor(bands, totalPieces),
    hasSet: pieces.some((p) => p.isSet || (p.setSize ?? 1) > 1),
  };
}

/**
 * The single source of truth for delivery cost. Used for the checkout preview
 * AND recomputed server-side at order time — they must agree, or the customer
 * sees one price and is charged another.
 */
export function quoteDelivery(
  zoneId: string,
  pieces: DeliverablePiece[],
): DeliveryQuote | null {
  const { vehicle, hasSet } = assess(pieces);

  // Outside Lagos isn't in the price list — the gallery quotes it per order.
  if (zoneId === OUTSIDE_LAGOS_ID) {
    return { vehicle, fee: 0, quoteOnRequest: true };
  }

  // Sets are quoted by hand too (the gallery's decision), so any set in the
  // basket sends the WHOLE order down the quote path. Pricing half an order
  // automatically and half by hand invites the two halves to disagree, and it's
  // one delivery run either way. The vehicle is still computed above so staff
  // have a sensible starting point when they write the quote.
  if (hasSet) {
    return { vehicle, fee: 0, quoteOnRequest: true };
  }

  const fee = deliveryFee(zoneId, vehicle);
  if (fee === null) return null;

  return { vehicle, fee, quoteOnRequest: false };
}

/** Where an order is going, as resolved from the customer's chosen address. */
export interface DeliveryDestination {
  /** Driving km from the studio; null if it couldn't be measured. */
  km: number | null;
  /** null if the address had no recognisable state. */
  inLagos: boolean | null;
}

export interface DistanceQuote {
  tier: DeliveryTier;
  fee: number;
  quoteOnRequest: boolean;
  /** Why it's quoted by hand, so checkout can say the right thing. */
  reason: "outside-lagos" | "outsourced" | "unmeasured" | null;
  km: number | null;
  pieces: number;
  /** Bulk surcharge included in fee (more than BULK_THRESHOLD pieces). */
  surcharge: number;
}

const TIER_RANK: Record<DeliveryTier, number> = {
  small: 0,
  large: 1,
  outsourced: 2,
};

function tierFor(p: DeliverablePiece): DeliveryTier | null {
  if (p.sizeId) {
    const s = getSize(p.sizeId);
    return s ? tierForInches(s.inches.w, s.inches.h) : null;
  }
  if (p.widthInches && p.heightInches) {
    return tierForInches(p.widthInches, p.heightInches);
  }
  return null;
}

/**
 * Distance-based pricing (the gallery's van rules, see data/distanceRates).
 * Same contract as quoteDelivery: the checkout preview and the order route
 * must both call this with the same inputs, or the customer sees one price
 * and is charged another.
 *
 * Sets are priced like everything else — each panel counts as a piece.
 */
export function quoteDeliveryByDistance(
  dest: DeliveryDestination,
  pieces: DeliverablePiece[],
): DistanceQuote {
  const totalPieces = pieces.reduce(
    (n, p) => n + (p.quantity || 1) * Math.max(1, p.setSize ?? 1),
    0,
  );
  const tiers = pieces.map(tierFor);
  // An unknown size can't be priced safely — treat it like an oversized piece.
  const tier = tiers.reduce<DeliveryTier>(
    (worst, t) =>
      TIER_RANK[t ?? "outsourced"] > TIER_RANK[worst]
        ? (t ?? "outsourced")
        : worst,
    "small",
  );

  const byHand = (reason: DistanceQuote["reason"]): DistanceQuote => ({
    tier,
    fee: 0,
    quoteOnRequest: true,
    reason,
    km: dest.km,
    pieces: totalPieces,
    surcharge: 0,
  });

  if (dest.inLagos === false) return byHand("outside-lagos"); // GIG Logistics
  if (tier === "outsourced") return byHand("outsourced"); // third-party courier
  if (
    dest.inLagos === null ||
    dest.km === null ||
    dest.km > MAX_AUTO_QUOTE_KM
  ) {
    return byHand("unmeasured");
  }

  const { fee, surcharge } = distanceFee(tier, dest.km, totalPieces);
  return {
    tier,
    fee,
    quoteOnRequest: false,
    reason: null,
    km: dest.km,
    pieces: totalPieces,
    surcharge,
  };
}

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  motorcycle: "Motorcycle",
  car: "Car",
  minitruck: "Mini-truck",
};
