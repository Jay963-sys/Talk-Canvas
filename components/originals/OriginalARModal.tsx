"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { generateFrameGLB } from "@/lib/frameModel";
import { generateFrameUSDZ } from "@/lib/frameUSDZ";
import { uploadModelToCloudinary, uploadUSDZToCloudinary } from "@/lib/upload";
import { originalFrameSwatch, originalSizeLabel } from "@/lib/originalDisplay";
import { USE_CUSTOM_USDZ } from "@/lib/arConfig";
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
  const [iosUrl, setIosUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Preparing your preview…");

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
        const opts = {
          imageUrl: getDownsizedUrl(original.imageUrl, 1200),
          frameColor: originalFrameSwatch(original),
          artWidth: (original.widthInches * 2.54) / 100, // inches → meters
          artHeight: (original.heightInches * 2.54) / 100,
          style: original.frameStyle as "regular" | "antique",
          shape: original.frameShape as "floating" | "box" | null,
          glass: original.glass,
        };

        // Namespaced with the original id (one-of-one), plus the frame-
        // determining fields so an admin edit invalidates the cache.
        const cacheKey = [
          `orig-${original.id}`,
          original.frameStyle,
          original.frameShape ?? "none",
          originalFrameSwatch(original),
          original.widthInches,
          original.heightInches,
          original.glass ? "g" : "n",
        ].join("|");

        // --- 1. Cache lookup
        try {
          const res = await fetch(
            `/api/ar-model?key=${encodeURIComponent(cacheKey)}`,
          );
          if (res.ok) {
            const cached = await res.json();
            if (cached?.glbUrl) {
              if (cancelled) return;
              setModelUrl(cached.glbUrl);
              if (USE_CUSTOM_USDZ && cached.usdzUrl) setIosUrl(cached.usdzUrl);
              return;
            }
          }
        } catch {}

        // --- 2. GLB (Android + in-page preview)
        setProgress("Generating 3D model…");
        const glb = await generateFrameGLB(opts);
        if (cancelled) return;

        setProgress("Uploading…");
        const glbUrl = await uploadModelToCloudinary(glb);
        if (cancelled) return;
        setModelUrl(glbUrl);

        // --- 3. Custom wall-anchored USDZ (best-effort). On failure we leave
        // iosUrl unset and iOS falls back to model-viewer's floor USDZ.
        let usdzUrl: string | null = null;
        if (USE_CUSTOM_USDZ) {
          try {
            const usdz = await generateFrameUSDZ(opts);
            if (cancelled) return;
            usdzUrl = await uploadUSDZToCloudinary(usdz);
            if (!cancelled) setIosUrl(usdzUrl);
          } catch (usdzErr) {
            console.warn(
              "Custom USDZ failed; falling back to model-viewer's auto USDZ:",
              usdzErr,
            );
          }
        }

        // --- 4. Write-through cache
        if (!cancelled && glbUrl) {
          fetch("/api/ar-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cacheKey, glbUrl, usdzUrl }),
          }).catch(() => {});
        }
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
            <ARViewer
              src={modelUrl}
              iosSrc={iosUrl ?? undefined}
              alt={`${original.title}, ${sizeLabel}`}
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
