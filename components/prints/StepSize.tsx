"use client";

import { SIZES, SIZE_CATEGORIES, formatInches, formatCm } from "@/data/sizes";
import { useConfigurator, formatNaira } from "@/lib/store";
import { getPrice } from "@/data/pricing";

export default function StepSize() {
  const { frame, glass, size, setSize } = useConfigurator();

  if (!frame) {
    return (
      <div className="slide-up">
        <p className="text-sm text-ink-soft">Please pick a frame first.</p>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Pick a size</h2>
      <p className="text-sm text-ink-soft mb-8">
        Prices shown for your {frame.shortName}
        {glass ? " (with glass)" : ""}. Greyed-out sizes aren't offered with
        this frame option.
      </p>

      <div className="space-y-10">
        {SIZE_CATEGORIES.map((cat) => {
          const catSizes = SIZES.filter((s) => s.category === cat.id);
          return (
            <section key={cat.id}>
              <h3 className="display-italic text-2xl mb-4">{cat.label}</h3>
              <div className="flex flex-col gap-2">
                {catSizes.map((s) => {
                  const price = getPrice(frame, glass, s);
                  const available = price !== null;
                  const isSelected = size?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => available && setSize(s)}
                      disabled={!available}
                      className={`px-5 py-4 border-[1.5px] flex items-center justify-between gap-4 text-left transition-all ${
                        !available
                          ? "border-line/50 opacity-40 cursor-not-allowed"
                          : isSelected
                            ? "border-ink bg-paper"
                            : "border-line hover:border-ink-soft cursor-pointer"
                      }`}
                    >
                      <div>
                        <p className="display-italic text-lg">
                          {formatInches(s)}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatCm(s)}
                        </p>
                      </div>
                      {available ? (
                        <p className="text-base font-medium">
                          {formatNaira(price!)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted italic">
                          Not available
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
