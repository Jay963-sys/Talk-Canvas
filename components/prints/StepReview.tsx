"use client";

import { Smartphone } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import FramedPreview from "./FramedPreview";

export default function StepReview() {
  const { image, frame, glass, setArOpen } = useConfigurator();
  if (!image || !frame) {
    return <p className="text-muted">Please complete previous steps first.</p>;
  }

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Review your print</h2>
      <p className="text-sm text-ink-soft mb-6">
        Preview before checkout
        {frame.shape === "box" && glass ? " (includes glass)" : ""}. Use AR to
        see it at scale on your wall.
      </p>

      <div className="bg-paper p-10 flex justify-center items-center min-h-[500px]">
        <FramedPreview image={image.url} frame={frame} />{" "}
      </div>

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
