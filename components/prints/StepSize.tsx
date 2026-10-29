"use client";

import { useState } from "react";
import {
  SIZES,
  isCustomSize,
  SIZE_CATEGORIES,
  formatInches,
  formatCm,
  orientationOf,
} from "@/data/sizes";
import { useConfigurator, formatNaira } from "@/lib/store";
import { getPrice } from "@/data/pricing";
import CustomSizeFields, {
  resolveCustomSize,
  CUSTOM_SIZE_ERRORS,
  type SizeUnit,
} from "./CustomSizeFields";

/** `/prints?size=32x48` (from the custom-order page) prefills the custom size. */
function sizeFromUrl(): { w: string; h: string } {
  if (typeof window === "undefined") return { w: "", h: "" };
  const m = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(
    new URLSearchParams(window.location.search).get("size") ?? "",
  );
  return m ? { w: m[1], h: m[2] } : { w: "", h: "" };
}

export default function StepSize() {
  const { image, frame, glass, size, setSize, setGlass } = useConfigurator();
  const [customW, setCustomW] = useState(() => sizeFromUrl().w);
  const [customH, setCustomH] = useState(() => sizeFromUrl().h);
  const [customUnit, setCustomUnit] = useState<SizeUnit>("inches");

  if (!frame)
    return <p className="text-ink-soft">Please pick a frame first.</p>;

  // Sizes are stored portrait; a landscape design gets them rotated so the
  // artwork isn't squeezed into an upright frame.
  const orientation = orientationOf(image);

  // Drop glass and take the size in one action. Order matters: setGlass clears
  // a now-invalid size, so select afterwards.
  const selectWithoutGlass = (s: (typeof SIZES)[number]) => {
    setGlass(false);
    setSize(s);
  };

  return (
    <div className="fade-in">
      <div className="flex items-baseline justify-between gap-4 mb-8 flex-wrap">
        <h2 className="display text-3xl font-normal">Pick a size</h2>
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">
          {orientation} design
        </span>
      </div>

      {orientation === "landscape" && (
        <p className="text-[13px] text-ink-soft mb-8 -mt-2 leading-relaxed">
          Sizes are shown landscape to match your design — width first.
        </p>
      )}

      {/* Glass isn't offered on the larger sizes, which greys out a lot of the
          grid at once. Say so up front rather than letting it read as "the
          gallery doesn't sell big prints." */}
      {glass && (
        <p className="text-[13px] text-ink-soft mb-8 -mt-2 leading-relaxed">
          Glass is only available on smaller sizes. Larger options below can be
          made without it — selecting one removes the glass.
        </p>
      )}

      {SIZE_CATEGORIES.map((cat) => (
        <section key={cat.id} className="mb-10">
          <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
            {cat.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIZES.filter((s) => s.category === cat.id).map((s) => {
              const price = getPrice(frame, glass, s);
              const available = price !== null;

              // Would this size work if we dropped the glass? Distinguishes
              // "not offered at all" from "not offered *with glass*".
              const priceNoGlass = glass ? getPrice(frame, false, s) : null;
              const glassOnlyBlocker = !available && priceNoGlass !== null;

              const clickable = available || glassOnlyBlocker;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (available) setSize(s);
                    else if (glassOnlyBlocker) selectWithoutGlass(s);
                  }}
                  disabled={!clickable}
                  className={`p-5 border text-left transition-all ${
                    !clickable
                      ? "opacity-30 cursor-not-allowed border-line"
                      : glassOnlyBlocker
                        ? "opacity-70 border-line border-dashed hover:opacity-100 hover:border-ink/50"
                        : size?.id === s.id
                          ? "border-ink bg-paper"
                          : "border-line hover:border-ink/50"
                  }`}
                >
                  <p className="display text-lg mb-1">
                    {formatInches(s, orientation)}
                  </p>
                  <p className="text-[12px] text-ink-soft mb-4">
                    {formatCm(s, orientation)}
                  </p>

                  {available ? (
                    <p className="text-[13px] font-medium">
                      {formatNaira(price!)}
                    </p>
                  ) : glassOnlyBlocker ? (
                    <>
                      <p className="text-[13px] font-medium text-ink-soft">
                        {formatNaira(priceNoGlass!)}{" "}
                        <span className="font-normal">without glass</span>
                      </p>
                      <p className="text-[11px] text-ink-soft mt-1.5">
                        Not available with glass — select to remove it
                      </p>
                    </>
                  ) : (
                    <p className="text-[13px] font-medium">Unavailable</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <CustomSizeSection
        width={customW}
        height={customH}
        unit={customUnit}
        onWidth={setCustomW}
        onHeight={setCustomH}
        onUnit={setCustomUnit}
      />
    </div>
  );
}

/**
 * Any size not on the list, priced the gallery's way (see buildCustomSize).
 * Picking it puts a normal size into the configurator, so crop, AR, cart and
 * checkout all work unchanged.
 */
function CustomSizeSection(props: {
  width: string;
  height: string;
  unit: SizeUnit;
  onWidth: (v: string) => void;
  onHeight: (v: string) => void;
  onUnit: (u: SizeUnit) => void;
}) {
  const { image, frame, glass, size, setSize, setGlass } = useConfigurator();
  if (!frame) return null;

  const orientation = orientationOf(image);
  const result = resolveCustomSize(props.width, props.height, props.unit);
  const custom = result?.ok ? result.size : null;
  const price = custom ? getPrice(frame, glass, custom) : null;
  const priceNoGlass = custom && glass ? getPrice(frame, false, custom) : null;
  const selected =
    !!custom && size?.id === custom.id;

  const choose = () => {
    if (!custom) return;
    if (price === null && priceNoGlass !== null) setGlass(false);
    setSize(custom);
  };

  return (
    <section className="mb-10 border-t border-line pt-10">
      <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-3">
        Custom size
      </p>
      <p className="text-[13px] text-ink-soft mb-6 leading-relaxed">
        Need a size that isn&apos;t listed? Enter it below and we&apos;ll price
        it against the closest size on our list.
      </p>

      <CustomSizeFields {...props} />

      {result && !result.ok && (
        <p className="text-[13px] text-ink-soft mt-4">
          {CUSTOM_SIZE_ERRORS[result.reason]}
        </p>
      )}

      {custom && result?.ok && (
        <button
          type="button"
          onClick={choose}
          disabled={price === null && priceNoGlass === null}
          className={`mt-6 w-full sm:w-auto p-5 border text-left transition-all ${
            selected ? "border-ink bg-paper" : "border-line hover:border-ink/50"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <p className="display text-lg mb-1">
            {formatInches(custom, orientation)}
          </p>
          <p className="text-[12px] text-ink-soft mb-4">
            {formatCm(custom, orientation)}
            {isCustomSize(custom) && (
              <> · priced as {formatInches(result.matched, orientation)}</>
            )}
          </p>
          {price !== null ? (
            <p className="text-[13px] font-medium">{formatNaira(price)}</p>
          ) : priceNoGlass !== null ? (
            <p className="text-[13px] font-medium text-ink-soft">
              {formatNaira(priceNoGlass)}{" "}
              <span className="font-normal">without glass — select to remove it</span>
            </p>
          ) : (
            <p className="text-[13px] font-medium">
              Not available with this frame
            </p>
          )}
        </button>
      )}
    </section>
  );
}
