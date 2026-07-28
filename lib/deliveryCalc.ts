import {
  bandForInches,
  vehicleFor,
  deliveryFee,
  OUTSIDE_LAGOS_ID,
  type SizeBand,
  type Vehicle,
} from "@/data/delivery";
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
  const totalPieces = pieces.reduce(
    (n, p) => n + (p.quantity || 1) * Math.max(1, p.setSize ?? 1),
    0,
  );
  const bands = pieces.map(bandFor).filter((b): b is SizeBand => b !== null);

  const vehicle = vehicleFor(bands, totalPieces);

  // Outside Lagos isn't in the price list — the gallery quotes it per order.
  if (zoneId === OUTSIDE_LAGOS_ID) {
    return { vehicle, fee: 0, quoteOnRequest: true };
  }

  // Sets are quoted by hand too (the gallery's decision), so any set in the
  // basket sends the WHOLE order down the quote path. Pricing half an order
  // automatically and half by hand invites the two halves to disagree, and it's
  // one delivery run either way. The vehicle is still computed above so staff
  // have a sensible starting point when they write the quote.
  if (pieces.some((p) => p.isSet || (p.setSize ?? 1) > 1)) {
    return { vehicle, fee: 0, quoteOnRequest: true };
  }

  const fee = deliveryFee(zoneId, vehicle);
  if (fee === null) return null;

  return { vehicle, fee, quoteOnRequest: false };
}

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  motorcycle: "Motorcycle",
  car: "Car",
  minitruck: "Mini-truck",
};
