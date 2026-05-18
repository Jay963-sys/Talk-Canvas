"use client";

import { useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import FramedPreview from "./FramedPreview";

const SIZE_SCALE: Record<string, number> = {
  a4: 0.18,
  a3: 0.26,
  a2: 0.36,
  a1: 0.5,
};

export default function ARModal() {
  const { image, frame, size, setArOpen } = useConfigurator();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!image || !frame || !size) return null;
  const scale = SIZE_SCALE[size.id] || 0.3;

  return (
    <div
      onClick={() => setArOpen(false)}
      className="fade-in fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={() => setArOpen(false)}
        className="fixed top-6 right-6 text-cream p-2 z-10"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
        {/* Mock wall scene */}
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #E8E0D2 0%, #D4C8B4 100%)",
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 h-[22%]"
            style={{
              background: "linear-gradient(180deg, #8B7355 0%, #6B5740 100%)",
            }}
          />
          <div
            className="absolute top-[28%] left-1/2 -translate-x-1/2 z-[5]"
            style={{ width: `${scale * 100}%` }}
          >
            <FramedPreview
              image={image.url}
              frame={frame}
              maxWidth={9999}
            />{" "}
          </div>
          <div className="absolute bottom-[22%] left-[8%] w-[20%] h-[15%] bg-[#3a2f24] rounded-t-lg opacity-60" />
        </div>

        <div className="mt-6 text-center text-cream">
          <p className="display-italic text-2xl">
            {size.name} {frame.name} frame, shown at approximate scale
          </p>
          <button className="mt-5 px-7 py-3.5 bg-accent text-cream text-sm font-medium tracking-wider inline-flex items-center gap-2.5">
            <Smartphone size={16} strokeWidth={1.5} />
            Launch camera AR (mobile)
          </button>
          <p className="text-[11px] text-muted mt-4 italic max-w-md mx-auto">
            Prototype: production version uses Google's &lt;model-viewer&gt;
            with a generated frame model. On mobile it activates the camera
            (ARKit/ARCore) to place the frame on a real wall at true scale.
          </p>
        </div>
      </div>
    </div>
  );
}
