import { getFrame } from "@/data/frames";
import type { Original } from "@/lib/db/schema";

export function originalSizeLabel(
  o: Pick<Original, "widthInches" | "heightInches">,
): string {
  return `${o.widthInches} × ${o.heightInches} in`;
}

export function originalFrameId(
  o: Pick<Original, "frameStyle" | "frameShape" | "frameColor">,
): string {
  return o.frameStyle === "antique"
    ? `antique-${o.frameColor}`
    : `regular-${o.frameShape}-${o.frameColor}`;
}

export function originalFrameLabel(
  o: Pick<Original, "frameStyle" | "frameShape" | "frameColor" | "glass">,
): string {
  const frame = getFrame(originalFrameId(o));
  const base = frame?.shortName ?? o.frameColor;
  return o.glass ? `${base} · with glass` : base;
}

export function originalFrameSwatch(
  o: Pick<Original, "frameStyle" | "frameShape" | "frameColor">,
): string {
  return getFrame(originalFrameId(o))?.swatchColor ?? "#1a1612";
}
