"use client";

import { Smartphone, AlertTriangle } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { orientationOf } from "@/data/sizes";
import { coverKeptFraction, targetAspect } from "@/lib/crop";
import FrameCropper from "./FrameCropper";

export default function StepReview() {
  const { image, set, frame, glass, size, setArOpen } = useConfigurator();
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

  const isSet = set !== null;

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">
        {isSet ? "Review your set" : "Review your print"}
      </h2>
      <p className="text-sm text-ink-soft mb-6">
        {isSet ? (
          <>
            All {set.pieces.length} pieces in {frame.name.toLowerCase()}
            {frame.shape === "box" && glass ? " with glass" : ""}, at the same
            size. Use AR to see the scale on your wall.
          </>
        ) : (
          <>
            Drag to set exactly how your image sits in the frame
            {frame.shape === "box" && glass ? " (includes glass)" : ""}. What
            you see is what we print — use AR to view it at scale on your wall.
          </>
        )}
      </p>

      <div className="bg-paper p-8 sm:p-10 flex justify-center items-center min-h-[500px]">
        {isSet ? (
          /*
            No cropper here on purpose. The panels of a split artwork are
            aligned by the gallery — recropping one of them independently would
            pull the piece out of register. Each panel gets the same centred
            fit against the chosen size instead.
          */
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            {set.pieces.map((piece, i) => (
              <div
                key={i}
                className="bg-cream p-2 shadow-sm"
                style={{ maxWidth: `${Math.floor(90 / set.pieces.length)}%` }}
              >
                <img
                  src={piece.url}
                  alt={`Piece ${i + 1} of ${set.pieces.length}`}
                  className="max-h-[380px] w-full object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <FrameCropper />
        )}
      </div>

      {shapeWarn && (
        <div className="mt-4 flex gap-3 p-4 border border-amber-300 bg-amber-50/40 text-amber-800 text-[13px] leading-relaxed">
          <AlertTriangle
            size={16}
            strokeWidth={1.5}
            className="shrink-0 mt-0.5"
          />
          <span>
            {isSet ? (
              <>
                These pieces are a different shape from this size, so only about{" "}
                {keptPct}% of each one fits. Pick a size closer to their
                proportions to keep the full artwork.
              </>
            ) : (
              <>
                Your image is a different shape from this size, so only about{" "}
                {keptPct}% of it fits. Reposition above to choose what&apos;s
                kept, or pick a size closer to your image&apos;s proportions.
              </>
            )}
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

      {/* The AR pipeline places one framed piece. Saying so is better than
          letting someone size a triptych off a single panel. */}
      {isSet && (
        <p className="mt-2 text-[12px] text-ink-soft text-center">
          AR shows one piece of the set at actual size — allow roughly{" "}
          {set.pieces.length}× the width, plus spacing, for the full hang.
        </p>
      )}
    </div>
  );
}
