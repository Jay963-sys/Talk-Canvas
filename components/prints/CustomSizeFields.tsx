"use client";

import { buildCustomSize, cmToInches, type CustomSizeResult } from "@/data/sizes";

export type SizeUnit = "inches" | "cm";

/** Customer's typed width/height in either unit → a priced custom size. */
export function resolveCustomSize(
  width: string,
  height: string,
  unit: SizeUnit,
): CustomSizeResult | null {
  const w = Number(width);
  const h = Number(height);
  if (!width || !height || !Number.isFinite(w) || !Number.isFinite(h)) {
    return null;
  }
  return unit === "cm"
    ? buildCustomSize(cmToInches(w), cmToInches(h))
    : buildCustomSize(w, h);
}

export const CUSTOM_SIZE_ERRORS: Record<
  Exclude<CustomSizeResult, { ok: true }>["reason"],
  string
> = {
  invalid: "Enter a width and height.",
  too_small: "That's smaller than we frame — the shortest side must be at least 8 in (20 cm).",
  too_large:
    "That's larger than our price list covers. Send us a custom request below and we'll quote it by hand.",
};

const inputClass =
  "w-28 px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

/** Width × height inputs with an inches / cm toggle. Purely presentational. */
export default function CustomSizeFields({
  width,
  height,
  unit,
  onWidth,
  onHeight,
  onUnit,
}: {
  width: string;
  height: string;
  unit: SizeUnit;
  onWidth: (v: string) => void;
  onHeight: (v: string) => void;
  onUnit: (u: SizeUnit) => void;
}) {
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="block text-sm text-ink-soft mb-2">Width</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          value={width}
          onChange={(e) => onWidth(e.target.value)}
          className={inputClass}
        />
      </div>
      <span className="text-muted pb-3 text-lg">×</span>
      <div>
        <label className="block text-sm text-ink-soft mb-2">Height</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          value={height}
          onChange={(e) => onHeight(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex border border-line bg-cream">
        {(["inches", "cm"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnit(u)}
            className={`px-4 py-3 text-sm transition-colors ${
              unit === u ? "bg-ink text-cream" : "text-ink-soft hover:bg-paper"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
