"use client";

import { useState } from "react";
import Link from "next/link";
import { formatInches, formatCm, isCustomSize } from "@/data/sizes";
import { formatNaira } from "@/lib/store";
import CustomSizeFields, {
  CustomSizeLimitNote,
  resolveCustomSize,
  CUSTOM_SIZE_ERRORS,
  type SizeUnit,
} from "./CustomSizeFields";

/**
 * Instant price for a size that isn't on the list. Customers used to email for
 * this; now the site quotes it the gallery's way and sends them straight into
 * the print studio with the size filled in.
 */
export default function CustomSizeQuote() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<SizeUnit>("inches");

  const result = resolveCustomSize(width, height, unit);
  const size = result?.ok ? result.size : null;

  const rows = size
    ? ([
        ["Regular frame", size.prices.regular],
        ["Box frame with glass", size.prices.regularGlass],
        ["Antique frame", size.prices.antique],
      ] as const)
    : [];

  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
        Price a custom size
      </h2>
      <p className="text-[14px] text-ink-soft mb-6 leading-relaxed">
        Enter the size you want and see the price instantly — no need to wait
        for a quote.
      </p>

      <CustomSizeFields
        width={width}
        height={height}
        unit={unit}
        onWidth={setWidth}
        onHeight={setHeight}
        onUnit={setUnit}
      />
      <CustomSizeLimitNote />

      {result && !result.ok && (
        <p className="text-[13px] text-ink-soft mt-4">
          {CUSTOM_SIZE_ERRORS[result.reason]}
        </p>
      )}

      {size && result?.ok && (
        <div className="mt-6 border border-line bg-cream p-6">
          <p className="display text-xl">{formatInches(size)}</p>
          <p className="text-[12px] text-ink-soft mb-5">
            {formatCm(size)}
            {isCustomSize(size) && (
              <> · priced as {formatInches(result.matched)}</>
            )}
          </p>
          <ul className="space-y-2 mb-6">
            {rows.map(([label, price]) => (
              <li
                key={label}
                className="flex justify-between text-[14px] border-b border-line/60 pb-2"
              >
                <span className="text-ink-soft">{label}</span>
                <span className="font-medium">
                  {price === null ? "Not available" : `from ${formatNaira(price)}`}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/prints?size=${size.inches.w}x${size.inches.h}`}
            prefetch={false}
            className="inline-block bg-ink text-cream px-6 py-3 text-[12px] uppercase tracking-widest hover:opacity-90"
          >
            Order this size
          </Link>
          <p className="text-[12px] text-ink-soft mt-3">
            Upload your design and pick a frame — this size will be waiting on
            the size step.
          </p>
        </div>
      )}
    </div>
  );
}
