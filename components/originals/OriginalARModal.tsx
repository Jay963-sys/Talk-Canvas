"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { generateFrameGLB } from "@/lib/frameModel";
import { uploadModelToCloudinary } from "@/lib/upload";
import { originalFrameSwatch, originalSizeLabel } from "@/lib/originalDisplay";
import ARViewer from "@/components/prints/ARViewer";
import type { Original } from "@/lib/db/schema";

function getDownsizedUrl(url: string, maxWidth = 1200): string {
  return url.replace("/upload/", `/upload/w_${maxWidth},c_fit,q_auto,f_jpg/`);
}

export default function OriginalARModal({
  original,
  onClose,
}: {
  original: Original;
  onClose: () => void;
}) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Generating 3D model…");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setProgress("Generating 3D model…");
        const blob = await generateFrameGLB({
          imageUrl: getDownsizedUrl(original.imageUrl, 1200),
          frameColor: originalFrameSwatch(original),
          artWidth: (original.widthInches * 2.54) / 100, // inches → meters
          artHeight: (original.heightInches * 2.54) / 100,
          style: original.frameStyle as "regular" | "antique",
          shape: original.frameShape as "floating" | "box" | null,
          glass: original.glass,
        });

        if (cancelled) return;
        setProgress("Uploading…");
        const url = await uploadModelToCloudinary(blob);
        if (!cancelled) setModelUrl(url);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to generate AR model",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [original]);

  const sizeLabel = originalSizeLabel(original);

  return (
    <div
      onClick={onClose}
      className="fade-in fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        className="fixed top-6 right-6 text-cream p-2 z-10"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
        <div className="relative aspect-[4/3] bg-[#1a1814] overflow-hidden">
          {modelUrl ? (
            <ARViewer src={modelUrl} alt={`${original.title}, ${sizeLabel}`} />
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-cream/80 text-center px-6">
              <p>{error}</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-cream/80">
              <Loader2
                className="animate-spin mb-3"
                size={32}
                strokeWidth={1.5}
              />
              <p className="text-sm">{progress}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-cream">
          <p className="display-italic text-2xl">
            {original.title} · {sizeLabel}
          </p>
          <p className="text-xs text-muted mt-3 max-w-md mx-auto leading-relaxed">
            Drag to rotate. On a phone, tap the AR icon (bottom-right of the
            viewer) to place it on a real wall at true scale.
          </p>
        </div>
      </div>
    </div>
  );
}
