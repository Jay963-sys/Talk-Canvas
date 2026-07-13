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
  const totalPieces = pieces.reduce((n, p) => n + (p.quantity || 1), 0);
  const bands = pieces.map(bandFor).filter((b): b is SizeBand => b !== null);

  const vehicle = vehicleFor(bands, totalPieces);

  // Outside Lagos isn't in the price list — the gallery quotes it per order.
  if (zoneId === OUTSIDE_LAGOS_ID) {
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
