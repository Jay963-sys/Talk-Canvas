"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Camera, Rotate3d } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useConfigurator } from "@/lib/store";
import { generateFrameGLB } from "@/lib/frameModel";
import { generateFrameUSDZ } from "@/lib/frameUSDZ";
import { uploadModelToCloudinary, uploadUSDZToCloudinary } from "@/lib/upload";
import { formatInches, orientCm, orientationOf } from "@/data/sizes";
import ARViewer from "./ARViewer";
import { USE_CUSTOM_USDZ } from "@/lib/arConfig";

function getDownsizedUrl(originalUrl: string, maxWidth = 1200): string {
  if (originalUrl.startsWith("blob:")) return originalUrl;
  return originalUrl.replace(
    "/upload/",
    `/upload/w_${maxWidth},c_fit,q_auto,f_jpg/`,
  );
}

function buildArUrl(glb: string, usdz: string | null, label: string) {
  if (typeof window === "undefined") return null;
  // A blob: GLB only exists in this browser tab — it can't be opened on a phone.
  if (glb.startsWith("blob:")) return null;
  const p = new URLSearchParams({ glb, label });
  if (usdz) p.set("usdz", usdz);
  return `${window.location.origin}/ar?${p.toString()}`;
}

export default function ARModal() {
  const { image, frame, glass, size, setArOpen } = useConfigurator();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [iosUrl, setIosUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Preparing your preview…");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [setArOpen]);

  useEffect(() => {
    if (!image || !frame || !size) return;
    let cancelled = false;
    let localGlbUrl: string | null = null;

    (async () => {
      try {
        // Orient the canvas to the artwork. Without this a landscape design is
        // built into a portrait frame and squashed.
        const orientation = orientationOf(image);
        const oriented = orientCm(size, orientation);
        const dims = { w: oriented.w / 100, h: oriented.h / 100 };
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
          oriented.w,
          oriented.h,
          orientation,
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
              usdzUrl: finalUsdzUrl,
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
  const label = `${frame.name}${glassNote} · ${formatInches(size, orientationOf(image))}`;
  const arUrl = modelUrl ? buildArUrl(modelUrl, iosUrl, label) : null;

  return (
    <div
      onClick={() => setArOpen(false)}
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
              alt={`${frame.name}${glassNote}, ${formatInches(size, orientationOf(image))}`}
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

          {/* Desktop: hand off to a phone via QR (skipped for un-uploaded
              local previews, which can't be opened on another device). */}
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
            onClick={() => setArOpen(false)}
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
