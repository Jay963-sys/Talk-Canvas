"use client";

import { SIZES } from "@/data/sizes";
import { useConfigurator, formatNaira } from "@/lib/store";

export default function StepSize() {
  const { size, setSize, frame } = useConfigurator();

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Pick a size</h2>
      <p className="text-sm text-ink-soft mb-6">
        Sized to standard ISO formats. Custom sizes available on request.
      </p>

      <div className="flex flex-col gap-3">
        {SIZES.map((s, i) => {
          const price = frame
            ? Math.round(s.basePrice * frame.priceMultiplier)
            : s.basePrice;
          return (
            <button
              key={s.id}
              onClick={() => setSize(s)}
              className={`px-6 py-5 border-[1.5px] flex items-center justify-between gap-5 text-left transition-all ${
                size?.id === s.id
                  ? "border-ink bg-paper"
                  : "border-line hover:border-ink-soft"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className="border border-ink-soft bg-paper shrink-0"
                  style={{
                    width: `${20 + i * 12}px`,
                    height: `${28 + i * 16}px`,
                  }}
                />
                <div>
                  <p className="display-italic text-[22px]">{s.name}</p>
                  <p className="text-xs text-muted mt-0.5">{s.dims}</p>
                </div>
              </div>
              <p className="text-[17px] font-medium">{formatNaira(price)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
