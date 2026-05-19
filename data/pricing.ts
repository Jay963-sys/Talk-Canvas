import type { Frame } from "./frames";
import type { PrintSize, SizePrices } from "./sizes";
import { SIZES } from "./sizes";

export type PriceTier = keyof SizePrices; // "regular" | "regularGlass" | "antique"

/**
 * Determines which price column applies for a given frame + glass selection.
 * - Antique frames always use the antique price (glass included)
 * - Regular Box with glass toggled on uses regularGlass
 * - Everything else uses regular
 */
export function getPriceTier(frame: Frame, glass: boolean): PriceTier {
  if (frame.style === "antique") return "antique";
  if (frame.shape === "box" && glass) return "regularGlass";
  return "regular";
}

export function getPrice(
  frame: Frame,
  glass: boolean,
  size: PrintSize,
): number | null {
  const tier = getPriceTier(frame, glass);
  return size.prices[tier];
}

export function isSizeAvailable(
  size: PrintSize,
  frame: Frame,
  glass: boolean,
): boolean {
  return getPrice(frame, glass, size) !== null;
}

export function getAvailableSizes(frame: Frame, glass: boolean): PrintSize[] {
  return SIZES.filter((s) => isSizeAvailable(s, frame, glass));
}
