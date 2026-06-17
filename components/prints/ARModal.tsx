"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { generateFrameGLB } from "@/lib/frameModel";
import { generateFrameUSDZ } from "@/lib/frameUSDZ";
import { uploadModelToCloudinary, uploadUSDZToCloudinary } from "@/lib/upload";
import { formatInches } from "@/data/sizes";
import ARViewer from "./ARViewer";
import { USE_CUSTOM_USDZ } from "@/lib/arConfig";

// Custom wall-anchored USDZ for iOS Quick Look.
//
// model-viewer's auto-generated USDZ ignores ar-placement and anchors to the
// FLOOR; a custom USDZ is the only way to get true wall placement on iOS. But a
// malformed USDZ breaks Quick Look (camera flicker-and-die), which is worse
// than the floor fallback — so this stays OFF until a generated .usdz has been
// validated with `xcrun usdchecker` and confirmed on a real iPhone.
//
// When false: behaves exactly like the GLB-only version (model-viewer makes its
// own floor USDZ). When true: generates + caches a wall-anchored USDZ and only
// then hands it to Quick Look. Flip to true once verified — and clear the cache
// (`DELETE FROM ar_models;`) so existing rows (usdzUrl = null) regenerate.
//
// Tip: swap for `process.env.NEXT_PUBLIC_ENABLE_CUSTOM_USDZ === "true"` if you'd
// rather toggle via env than edit code.

function getDownsizedUrl(originalUrl: string, maxWidth = 1200): string {
  if (originalUrl.startsWith("blob:")) return originalUrl;
  return originalUrl.replace(
    "/upload/",
    `/upload/w_${maxWidth},c_fit,q_auto,f_jpg/`,
  );
}

export default function ARModal() {
  const { image, frame, glass, size, setArOpen } = useConfigurator();
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
    if (!image || !frame || !size) return;
    let cancelled = false;
    let localGlbUrl: string | null = null;

    (async () => {
      try {
        const dims = { w: size.cm.w / 100, h: size.cm.h / 100 };
        const opts = {
          imageUrl: getDownsizedUrl(image.url, 1200),
          frameColor: frame.swatchColor,
          artWidth: dims.w,
          artHeight: dims.h,
          style: frame.style,
          shape: frame.shape,
          glass,
        };

        const isLocalBlob = image.url.startsWith("blob:");
        const cacheKey = [
          image.publicId || "custom",
          frame.style,
          frame.shape ?? "none",
          frame.swatchColor,
          size.cm.w,
          size.cm.h,
          glass ? "g" : "n",
        ].join("|");

        // --- 1. Cache lookup (Cloudinary-hosted only; skip local blobs)
        if (!isLocalBlob && image.publicId) {
          try {
            const res = await fetch(
              `/api/ar-model?key=${encodeURIComponent(cacheKey)}`,
            );
            if (res.ok) {
              const cached = await res.json();
              if (cached?.glbUrl) {
                if (cancelled) return;
                setModelUrl(cached.glbUrl);
                // Only trust a cached USDZ when the custom path is enabled.
                if (USE_CUSTOM_USDZ && cached.usdzUrl) {
                  setIosUrl(cached.usdzUrl);
                }
                return;
              }
            }
          } catch {}
        }

        // --- 2. GLB generation (always — powers Android + the in-page preview)
        setProgress("Generating 3D model…");
        const glb = await generateFrameGLB(opts);
        if (cancelled) return;

        let finalGlbUrl: string | null = null;
        if (isLocalBlob) {
          localGlbUrl = URL.createObjectURL(glb);
          setModelUrl(localGlbUrl);
        } else {
          setProgress("Uploading…");
          finalGlbUrl = await uploadModelToCloudinary(glb);
          if (cancelled) return;
          setModelUrl(finalGlbUrl);
        }

        // --- 3. Custom wall-anchored USDZ — best-effort, Cloudinary-hosted only.
        // On ANY failure we leave iosUrl unset, so model-viewer falls back to
        // its own floor USDZ and AR keeps working.
        let finalUsdzUrl: string | null = null;
        if (USE_CUSTOM_USDZ && !isLocalBlob) {
          try {
            const usdz = await generateFrameUSDZ(opts);
            if (cancelled) return;
            finalUsdzUrl = await uploadUSDZToCloudinary(usdz);
            if (!cancelled) setIosUrl(finalUsdzUrl);
          } catch (usdzErr) {
            console.warn(
              "Custom USDZ failed; falling back to model-viewer's auto USDZ:",
              usdzErr,
            );
          }
        }

        // --- 4. Write-through cache (Cloudinary-hosted only)
        if (!cancelled && !isLocalBlob && finalGlbUrl && image.publicId) {
          fetch("/api/ar-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cacheKey,
              glbUrl: finalGlbUrl,
              usdzUrl: finalUsdzUrl, // null unless the custom USDZ succeeded
            }),
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
      if (localGlbUrl) URL.revokeObjectURL(localGlbUrl);
    };
  }, [image, frame, size, glass]);

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
              iosSrc={iosUrl ?? undefined}
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
        {/* ... keeping your text elements below ... */}
      </div>
    </div>
  );
}
