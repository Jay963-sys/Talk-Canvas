"use client";

import {
  SIZES,
  SIZE_CATEGORIES,
  formatInches,
  formatCm,
  orientationOf,
} from "@/data/sizes";
import { useConfigurator, formatNaira } from "@/lib/store";
import { getPrice } from "@/data/pricing";

export default function StepSize() {
  const { image, frame, glass, size, setSize } = useConfigurator();

  if (!frame)
    return <p className="text-ink-soft">Please pick a frame first.</p>;

  // Sizes are stored portrait; a landscape design gets them rotated so the
  // artwork isn't squeezed into an upright frame.
  const orientation = orientationOf(image);

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

      {SIZE_CATEGORIES.map((cat) => (
        <section key={cat.id} className="mb-10">
          <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
            {cat.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIZES.filter((s) => s.category === cat.id).map((s) => {
              const price = getPrice(frame, glass, s);
              const available = price !== null;
              return (
                <button
                  key={s.id}
                  onClick={() => available && setSize(s)}
                  disabled={!available}
                  className={`p-5 border text-left transition-all ${!available ? "opacity-30 cursor-not-allowed border-line" : size?.id === s.id ? "border-ink bg-paper" : "border-line hover:border-ink/50"}`}
                >
                  <p className="display text-lg mb-1">
                    {formatInches(s, orientation)}
                  </p>
                  <p className="text-[12px] text-ink-soft mb-4">
                    {formatCm(s, orientation)}
                  </p>
                  <p className="text-[13px] font-medium">
                    {available ? formatNaira(price!) : "Unavailable"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
