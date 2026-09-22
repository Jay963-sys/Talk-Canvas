"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Camera, Rotate3d } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useConfigurator } from "@/lib/store";
import {
  generateFrameGLB,
  generateSetGLB,
  SET_GAP_M,
  type FrameModelOptions,
} from "@/lib/frameModel";
import { generateFrameUSDZ } from "@/lib/frameUSDZ";
import { uploadModelToCloudinary, uploadUSDZToCloudinary } from "@/lib/upload";
import { formatInches, orientCm, orientationOf } from "@/data/sizes";
import {
  cloudinaryChain,
  cropTransform,
  isFullCrop,
  normalizeDeg,
} from "@/lib/crop";
import ARViewer from "./ARViewer";
import { USE_CUSTOM_USDZ } from "@/lib/arConfig";
import type { UploadedImage } from "@/lib/store";

function buildArUrl(glb: string, usdz: string | null, label: string) {
  if (typeof window === "undefined") return null;
  // A blob: GLB only exists in this browser tab — it can't be opened on a phone.
  if (glb.startsWith("blob:")) return null;
  const p = new URLSearchParams({ glb, label });
  if (usdz) p.set("usdz", usdz);
  return `${window.location.origin}/ar?${p.toString()}`;
}

export default function ARModal() {
  const { image, set, frame, glass, size, crop, setArOpen } = useConfigurator();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [iosUrl, setIosUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Preparing your preview…");

  // Portal to <body> so the overlay escapes any ancestor with a transform,
  // filter or animation (e.g. `.fade-in`, the film-grain layer). Such an
  // ancestor creates a stacking context that traps our z-index inside it —
  // which is why the sticky header was painting over the model.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

    // A set's extra panels ride along on `set.pieces`; `image` is always
    // `pieces[0]` (see store.ts). The GLB — which powers both the in-page 3D
    // preview and Android's scene-viewer AR — should show every panel. The
    // iOS Quick Look USDZ stays single-panel (see note below): true
    // wall-anchored multi-panel AR, with customer-adjustable spacing, is
    // separate, bigger work.
    const panels: UploadedImage[] =
      set && set.pieces.length > 1 ? set.pieces : [image];
    const isSet = panels.length > 1;

    (async () => {
      try {
        // Per-panel model options. Sets never carry a crop — each panel is
        // used in full (the gallery already aligned them; recropping one
        // would break the piece) — so only the single-image path applies
        // the customer's crop/rotation.
        // Every panel's texture gets baked into the same GLB, so a set's
        // file size scales with panel count. Shrink each panel's texture
        // width so the *combined* pixel budget — and roughly the GLB size —
        // stays close to a single panel's (Cloudinary's free plan caps
        // uploads at 10MB; a 3-panel set at full 1200px each blew past it).
        // n=1 keeps today's 1200px exactly.
        const textureWidth = Math.round(1200 / Math.sqrt(panels.length));

        const panelOpts: FrameModelOptions[] = panels.map((piece) => {
          const orientation = orientationOf(piece);
          const oriented = orientCm(size, orientation);
          const dims = { w: oriented.w / 100, h: oriented.h / 100 };

          const natural = { w: piece.width, h: piece.height };
          const cropParts =
            !isSet && crop && !isFullCrop(crop)
              ? [cropTransform(crop, natural)]
              : [];
          const textureUrl = piece.url.startsWith("blob:")
            ? piece.url
            : cloudinaryChain(piece.url, [
                ...cropParts,
                `w_${textureWidth},c_fit,q_auto,f_jpg`,
              ]);

          return {
            imageUrl: textureUrl,
            frameColor: frame.swatchColor,
            artWidth: dims.w,
            artHeight: dims.h,
            style: frame.style,
            shape: frame.shape,
            glass,
          };
        });

        const isLocalBlob = panels.some((p) => p.url.startsWith("blob:"));

        const cropSig =
          !isSet && crop && !isFullCrop(crop)
            ? `${Math.round(crop.x * 1000)},${Math.round(crop.y * 1000)},${Math.round(crop.w * 1000)},${Math.round(crop.h * 1000)},r${normalizeDeg(crop.rotation ?? 0)}`
            : "full";
        const cacheKey = [
          isSet
            ? `set:${set!.setId}:${panels.map((p) => p.publicId || "custom").join(",")}`
            : image.publicId || "custom",
          frame.style,
          frame.shape ?? "none",
          frame.swatchColor,
          panelOpts
            .map(
              (p) =>
                `${Math.round(p.artWidth * 1000)}x${Math.round(p.artHeight * 1000)}`,
            )
            .join(","),
          glass ? "g" : "n",
          isSet ? "set" : cropSig,
        ].join("|");

        // --- 1. Cache lookup (Cloudinary-hosted only; skip local blobs)
        if (!isLocalBlob && (isSet || image.publicId)) {
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

        // Re-runs panel-opt construction at a smaller texture width — used
        // if the first upload still trips Cloudinary's size cap (a set with
        // several panels, or an unusually large print size).
        const buildGlbAt = async (width: number) => {
          const opts =
            width === textureWidth
              ? panelOpts
              : panels.map((piece, i) => ({
                  ...panelOpts[i],
                  imageUrl: piece.url.startsWith("blob:")
                    ? piece.url
                    : cloudinaryChain(piece.url, [
                        ...(!isSet && crop && !isFullCrop(crop)
                          ? [
                              cropTransform(crop, {
                                w: piece.width,
                                h: piece.height,
                              }),
                            ]
                          : []),
                        `w_${width},c_fit,q_auto,f_jpg`,
                      ]),
                }));
          return isSet
            ? generateSetGLB(opts, SET_GAP_M)
            : generateFrameGLB(opts[0]);
        };

        let glb = await buildGlbAt(textureWidth);
        if (cancelled) return;

        let finalGlbUrl: string | null = null;
        if (isLocalBlob) {
          localGlbUrl = URL.createObjectURL(glb);
          setModelUrl(localGlbUrl);
        } else {
          setProgress("Uploading…");
          try {
            finalGlbUrl = await uploadModelToCloudinary(glb);
          } catch (uploadErr) {
            // Cloudinary's free-plan 10MB cap surfaces as a 400 naming the
            // file size — step the texture width down and retry once before
            // giving up. Any other upload error still bubbles as normal.
            const msg =
              uploadErr instanceof Error
                ? uploadErr.message
                : String(uploadErr);
            if (/file size too large/i.test(msg) && textureWidth > 400) {
              setProgress("Optimizing for upload…");
              const smallerWidth = Math.max(
                400,
                Math.round(textureWidth * 0.6),
              );
              glb = await buildGlbAt(smallerWidth);
              if (cancelled) return;
              finalGlbUrl = await uploadModelToCloudinary(glb);
            } else {
              throw uploadErr;
            }
          }
          if (cancelled) return;
          setModelUrl(finalGlbUrl);
        }

        // --- 3. Custom wall-anchored USDZ — best-effort, Cloudinary-hosted
        // only, and single-panel only (canonical piece), even for a set.
        // A set's iOS "See it on your wall" AR still shows one piece at
        // true size, same as before this change — multi-panel wall AR is
        // the deferred, bigger feature.
        let finalUsdzUrl: string | null = null;
        if (USE_CUSTOM_USDZ && !isLocalBlob) {
          try {
            const usdz = await generateFrameUSDZ(panelOpts[0]);
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
        if (
          !cancelled &&
          !isLocalBlob &&
          finalGlbUrl &&
          (isSet || image.publicId)
        ) {
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
  }, [image, set, frame, size, glass, crop]);

  if (!image || !frame || !size) return null;

  const glassNote = frame.shape === "box" && glass ? " · with glass" : "";
  const isSet = !!set && set.pieces.length > 1;
  const label = isSet
    ? `${frame.name}${glassNote} · ${formatInches(size, orientationOf(image))} · Set of ${set!.pieces.length}`
    : `${frame.name}${glassNote} · ${formatInches(size, orientationOf(image))}`;
  const arUrl = modelUrl ? buildArUrl(modelUrl, iosUrl, label) : null;

  if (!mounted) return null;

  const modal = (
    <div
      onClick={() => setArOpen(false)}
      className="fade-in fixed inset-x-0 top-0 z-[200] h-[100dvh] overflow-y-auto overscroll-contain bg-black/90 flex flex-col items-center justify-start py-10 px-6"
    >
      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
        <div className="relative aspect-[3/4] md:aspect-[4/3] bg-[#1a1814] overflow-hidden">
          {modelUrl && (
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm text-cream/90 rounded-full px-3 py-1.5">
              <Rotate3d size={14} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-widest">
                3D preview
              </span>
            </div>
          )}

          {modelUrl ? (
            <ARViewer src={modelUrl} iosSrc={iosUrl ?? undefined} alt={label}>
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
            {isSet ? (
              <>
                This is a 3D preview of the full set — drag to rotate and
                inspect. On your phone, tap{" "}
                <span className="text-cream/90">See it on your wall</span> to
                place one piece in your room at true size; allow roughly the
                combined width, plus spacing, for the full hang.
              </>
            ) : (
              <>
                This is a 3D preview — drag to rotate and inspect the frame. On
                your phone, tap{" "}
                <span className="text-cream/90">See it on your wall</span> to
                place it in your room at true size.
              </>
            )}
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

  return createPortal(modal, document.body);
}
