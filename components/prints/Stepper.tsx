"use client";

import { useConfigurator } from "@/lib/store";
import { Check } from "lucide-react";
import { Fragment } from "react";

const STEPS = ["Upload", "Frame", "Size", "Review"];

export default function Stepper() {
  const { step, setStep } = useConfigurator();

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6 overflow-x-auto pb-4 custom-scrollbar">
      {STEPS.map((s, i) => (
        <Fragment key={s}>
          <button
            onClick={() => i < step && setStep(i)}
            disabled={i >= step}
            className={`flex items-center gap-2.5 transition-opacity ${
              i <= step ? "opacity-100" : "opacity-40"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-medium transition-colors ${
                i < step
                  ? "bg-ink text-cream border-ink"
                  : i === step
                    ? "border-ink text-ink bg-transparent"
                    : "border-muted text-ink bg-transparent"
              }`}
            >
              {i < step ? <Check size={10} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="text-[11px] uppercase tracking-widest font-medium whitespace-nowrap">
              {s}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px bg-line min-w-[20px] max-w-[40px]" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
