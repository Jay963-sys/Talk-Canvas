"use client";

import { FRAMES } from "@/data/frames";
import { useConfigurator } from "@/lib/store";

export default function StepFrame() {
  const { frame, setFrame } = useConfigurator();

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Choose a frame</h2>
      <p className="text-sm text-ink-soft mb-6">
        All frames are hand-finished with archival materials. Glass:
        anti-reflective museum.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {FRAMES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFrame(f)}
            className={`p-5 bg-paper border-[1.5px] text-left transition-transform hover:-translate-y-0.5 ${
              frame?.id === f.id ? "border-ink" : "border-line"
            }`}
          >
            <div
              className="aspect-[4/5] p-3.5 mb-4"
              style={{ background: f.swatch }}
            >
              <div className="w-full h-full bg-cream" />
            </div>
            <p className="display-italic text-xl">{f.name}</p>
            <p className="text-xs text-muted mt-1">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
