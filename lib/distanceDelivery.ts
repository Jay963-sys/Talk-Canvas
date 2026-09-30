// Distance-based delivery pricing. Kept separate from lib/deliveryCalc.ts
// so the demo doesn't touch live checkout logic.

export type DistancePricing = {
  baseFee: number; // flat fee on every delivery (₦)
  perKm: number; // charged per driving km (₦)
  minFee: number; // floor (₦)
  maxFee: number; // cap (₦)
};

export const DEFAULT_DISTANCE_PRICING: DistancePricing = {
  baseFee: 1500,
  perKm: 250,
  minFee: 2500,
  maxFee: 20000,
};

export function calcDistanceFee(
  km: number,
  p: DistancePricing = DEFAULT_DISTANCE_PRICING,
) {
  const raw = p.baseFee + km * p.perKm;
  const clamped = Math.min(p.maxFee, Math.max(p.minFee, raw));
  return {
    km,
    raw,
    fee: Math.round(clamped / 50) * 50, // round to nearest ₦50
    capped: raw > p.maxFee,
    floored: raw < p.minFee,
  };
}
