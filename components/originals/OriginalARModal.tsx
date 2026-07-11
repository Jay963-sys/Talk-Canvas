"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Camera, Rotate3d } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

function buildArUrl(glb: string, usdz: string | null, label: string) {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams({ glb, label });
  if (usdz) p.set("usdz", usdz);
  return `${window.location.origin}/ar?${p.toString()}`;
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

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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
  const label = `${original.title} · ${sizeLabel}`;
  const arUrl = modelUrl ? buildArUrl(modelUrl, iosUrl, label) : null;

  return (
    <div
      onClick={onClose}
      className="fade-in fixed inset-x-0 top-0 z-[100] h-[100dvh] overflow-y-auto bg-black/90 flex flex-col items-center justify-center p-6"
    >
      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
        <div className="relative aspect-[4/3] bg-[#1a1814] overflow-hidden">
          {modelUrl && (
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm text-cream/90 rounded-full px-3 py-1.5">
              <Rotate3d size={14} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-widest">
                3D preview
              </span>
            </div>
          )}

          {modelUrl ? (
            <ARViewer
              src={modelUrl}
              iosSrc={iosUrl ?? undefined}
              alt={`${original.title}, ${sizeLabel}`}
            >
              <button
                slot="ar-button"
                className="flex items-center gap-2 bg-cream text-ink text-[12px] uppercase tracking-widest font-medium px-5 py-3 rounded-full shadow-lg"
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                <Camera size={16} strokeWidth={1.5} />
                See it on your wall
              </button>
            </ARViewer>
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
          <p className="display-italic text-2xl">{label}</p>
          <p className="text-xs text-muted mt-3 max-w-md mx-auto leading-relaxed">
            This is a 3D preview — drag to rotate and inspect the frame. On your
            phone, tap{" "}
            <span className="text-cream/90">See it on your wall</span> to place
            it in your room at true size.
          </p>

          {/* Desktop: no AR here, so offer a scan-to-phone handoff. */}
          {arUrl && (
            <div className="hidden lg:flex items-center justify-center gap-4 mt-6">
              <div className="bg-cream p-3 rounded-lg">
                <QRCodeSVG value={arUrl} size={132} level="M" />
              </div>
              <div className="text-left max-w-[220px]">
                <p className="text-sm text-cream">Prefer your phone?</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Scan to open the wall preview on your phone — AR needs a phone
                  camera.
                </p>
              </div>
            </div>
          )}
          {/* Single, unmissable exit — same on mobile and desktop. Esc also closes. */}
          <button
            type="button"
            onClick={onClose}
            className="mt-8 w-full flex items-center justify-center gap-2 border border-cream/30 text-cream py-4 text-[12px] uppercase tracking-widest hover:bg-cream hover:text-ink hover:border-cream transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}
