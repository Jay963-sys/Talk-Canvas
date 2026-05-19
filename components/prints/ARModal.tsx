"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { generateFrameGLB } from "@/lib/frameModel";
import { uploadModelToCloudinary } from "@/lib/upload";
import { formatInches } from "@/data/sizes";
import ARViewer from "./ARViewer";

function getDownsizedUrl(originalUrl: string, maxWidth = 1200): string {
  return originalUrl.replace(
    "/upload/",
    `/upload/w_${maxWidth},c_fit,q_auto,f_jpg/`,
  );
}

export default function ARModal() {
  const { image, frame, glass, size, setArOpen } = useConfigurator();
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
    if (!image || !frame || !size) return;
    let cancelled = false;

    (async () => {
      try {
        // size.cm gives real-world centimeters — convert to meters for AR
        const dims = { w: size.cm.w / 100, h: size.cm.h / 100 };

        setProgress("Generating 3D model…");
        const blob = await generateFrameGLB({
          imageUrl: getDownsizedUrl(image.url, 1200),
          frameColor: frame.swatchColor,
          artWidth: dims.w,
          artHeight: dims.h,
          style: frame.style,
          shape: frame.shape,
          glass,
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
  }, [image, frame, size]);

  if (!image || !frame || !size) return null;

  const glassNote = frame.shape === "box" && glass ? " · with glass" : "";

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
        <div className="relative aspect-[4/3] bg-[#1a1814] overflow-hidden">
          {modelUrl ? (
            <ARViewer
              src={modelUrl}
              alt={`${frame.name}${glassNote}, ${formatInches(size)}`}
            />
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
            {formatInches(size)} · {frame.shortName}
            {glassNote}
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
