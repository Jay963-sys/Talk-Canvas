"use client";

import { Smartphone, AlertTriangle } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { orientationOf } from "@/data/sizes";
import { coverKeptFraction, targetAspect } from "@/lib/crop";
import FrameCropper from "./FrameCropper";

export default function StepReview() {
  const { image, frame, glass, size, setArOpen } = useConfigurator();
  if (!image || !frame || !size) {
    return <p className="text-muted">Please complete previous steps first.</p>;
  }

  const orientation = orientationOf(image);
  const natural = { w: image.width, h: image.height };

  // Composition only. Resolution isn't flagged — the gallery upscales/enhances
  // uploads before printing, so a low-DPI note would only confuse customers.
  // Shape is different: enhancement can't add back what a mismatched frame
  // trims, so this warning stays.
  const keptPct = Math.round(
    coverKeptFraction(natural, targetAspect(size, orientation)) * 100,
  );
  const shapeWarn = keptPct < 60;

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Review your print</h2>
      <p className="text-sm text-ink-soft mb-6">
        Drag to set exactly how your image sits in the frame
        {frame.shape === "box" && glass ? " (includes glass)" : ""}. What you
        see is what we print — use AR to view it at scale on your wall.
      </p>

      <div className="bg-paper p-8 sm:p-10 flex justify-center items-center min-h-[500px]">
        <FrameCropper />
      </div>

      {shapeWarn && (
        <div className="mt-4 flex gap-3 p-4 border border-amber-300 bg-amber-50/40 text-amber-800 text-[13px] leading-relaxed">
          <AlertTriangle
            size={16}
            strokeWidth={1.5}
            className="shrink-0 mt-0.5"
          />
          <span>
            Your image is a different shape from this size, so only about{" "}
            {keptPct}% of it fits. Reposition above to choose what&apos;s kept,
            or pick a size closer to your image&apos;s proportions.
          </span>
        </div>
      )}

      <button
        onClick={() => setArOpen(true)}
        className="mt-4 w-full py-[18px] border border-line text-sm font-medium flex items-center justify-center gap-3 transition-all hover:border-ink hover:bg-ink hover:text-cream"
      >
        <Smartphone size={18} strokeWidth={1.5} />
        Preview on your wall (AR)
      </button>
    </div>
  );
}
