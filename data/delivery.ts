/**
 * Lagos delivery pricing.
 *
 * Derived from the gallery's town-level price list (PROPOSED DELIVERY PRICE
 * LIST, 14/03/2026), collapsed to LGA level: 17 choices for the customer
 * instead of 200+ towns. Each LGA takes the MAXIMUM price of its towns for a
 * given size band + vehicle, so the gallery is never out of pocket on a
 * cheaper-town assumption.
 *
 * The 37% increase and 7.5% VAT are already baked into these figures.
 *
 * Vehicle is DERIVED from the cart, never chosen by the customer — otherwise
 * everyone picks the bike and a 48x48 that physically can't go on one loses
 * the gallery money.
 */

export type Vehicle = "motorcycle" | "car" | "minitruck";

/** Size bands from the price list, keyed off the piece's SHORTER side. */
export type SizeBand = "small" | "medium" | "large";

/** 4+ framed pieces won't fit on a motorcycle. */
export const MOTORCYCLE_MAX_PIECES = 3;

export interface DeliveryZone {
  id: string;
  label: string;
  prices: Record<Vehicle, number>;
}

/**
 * Size band from a piece's dimensions in inches.
 *   small  — 24x36 and below   (shorter side < 36")
 *   medium — 36x48 and above   (shorter side 36–47")
 *   large  — 48x48 and above   (shorter side 48"+)
 */
export function bandForInches(w: number, h: number): SizeBand {
  const shorter = Math.min(w, h);
  if (shorter >= 48) return "large";
  if (shorter >= 36) return "medium";
  return "small";
}

/**
 * Vehicle needed for a whole cart. Big pieces force a bigger vehicle; lots of
 * small ones do too.
 */
export function vehicleFor(bands: SizeBand[], totalPieces: number): Vehicle {
  if (bands.includes("large")) return "minitruck";
  if (bands.includes("medium")) return "car";
  // All small — but a bike only carries so many frames.
  return totalPieces > MOTORCYCLE_MAX_PIECES ? "car" : "motorcycle";
}

// Prices are the max across each LGA's towns, per vehicle.
export const LAGOS_ZONES: DeliveryZone[] = [
  {
    id: "agege",
    label: "Agege",
    prices: { motorcycle: 8000, car: 17000, minitruck: 17000 },
  },
  {
    id: "alimosho",
    label: "Alimosho",
    prices: { motorcycle: 10000, car: 22000, minitruck: 23000 },
  },
  {
    id: "amuwo-odofin",
    label: "Amuwo-Odofin (incl. Festac)",
    prices: { motorcycle: 15000, car: 53000, minitruck: 23000 },
  },
  {
    id: "apapa",
    label: "Apapa",
    prices: { motorcycle: 11000, car: 30000, minitruck: 12000 },
  },
  {
    id: "badagry",
    label: "Badagry",
    prices: { motorcycle: 16000, car: 48000, minitruck: 34000 },
  },
  {
    id: "epe",
    label: "Epe",
    prices: { motorcycle: 24000, car: 73000, minitruck: 32000 },
  },
  {
    id: "eti-osa",
    label: "Eti-Osa (Lekki, VI, Ikoyi, Ajah)",
    prices: { motorcycle: 17000, car: 59000, minitruck: 15000 },
  },
  {
    id: "ifako-ijaiye",
    label: "Ifako-Ijaiye",
    prices: { motorcycle: 6000, car: 15000, minitruck: 23000 },
  },
  {
    id: "ikeja",
    label: "Ikeja",
    prices: { motorcycle: 8000, car: 18000, minitruck: 17000 },
  },
  {
    id: "ikorodu",
    label: "Ikorodu",
    prices: { motorcycle: 14000, car: 44000, minitruck: 22000 },
  },
  {
    id: "kosofe",
    label: "Kosofe (Ketu, Ogudu, Magodo)",
    prices: { motorcycle: 8000, car: 23000, minitruck: 15000 },
  },
  {
    id: "lagos-island",
    label: "Lagos Island",
    prices: { motorcycle: 11000, car: 38000, minitruck: 12000 },
  },
  {
    id: "lagos-mainland",
    label: "Lagos Mainland (Yaba, Ebute Metta)",
    prices: { motorcycle: 10000, car: 28000, minitruck: 12000 },
  },
  {
    id: "mushin",
    label: "Mushin",
    prices: { motorcycle: 8000, car: 21000, minitruck: 17000 },
  },
  {
    id: "ojo",
    label: "Ojo (Okokomaiko, Iba)",
    prices: { motorcycle: 14000, car: 33000, minitruck: 28000 },
  },
  {
    id: "oshodi-isolo",
    label: "Oshodi-Isolo",
    prices: { motorcycle: 12000, car: 33000, minitruck: 18000 },
  },
  {
    id: "shomolu",
    label: "Shomolu (Bariga, Gbagada)",
    prices: { motorcycle: 11000, car: 24000, minitruck: 15000 },
  },
  {
    id: "surulere",
    label: "Surulere",
    prices: { motorcycle: 13000, car: 28000, minitruck: 13000 },
  },
];

export function getZone(id: string): DeliveryZone | undefined {
  return LAGOS_ZONES.find((z) => z.id === id);
}

/** The fee for a zone + vehicle. */
export function deliveryFee(zoneId: string, vehicle: Vehicle): number | null {
  const zone = getZone(zoneId);
  if (!zone) return null;
  return zone.prices[vehicle];
}

export const OUTSIDE_LAGOS_ID = "outside-lagos";

export const OUTSIDE_LAGOS_NOTE =
  "We'll contact you with a delivery quote — outside-Lagos delivery is priced per order, based on location, size and quantity.";
