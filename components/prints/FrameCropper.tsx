"use client";

import { useEffect, useRef } from "react";
import { useConfigurator } from "@/lib/store";
import { orientationOf } from "@/data/sizes";
import {
  targetAspect,
  coverForRotation,
  clampCrop,
  rotatedCanvas,
  type Crop,
} from "@/lib/crop";
import { frameInset } from "./FramedPreview";

/** How far in the customer may zoom: crop shrinks to 40% of the cover size. */
const MIN_ZOOM = 0.4;
/** Free rotation range, in whole degrees. */
const ROT_MIN = -180;
const ROT_MAX = 180;

export default function FrameCropper() {
  const { image, frame, size, crop, setCrop } = useConfigurator();
  const windowRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);

  const hasCtx = !!(image && frame && size);
  const natural = image ? { w: image.width, h: image.height } : { w: 1, h: 1 };
  const orientation = orientationOf(image);
  const aspect = image && size ? targetAspect(size, orientation) : 1;

  const deg = crop?.rotation ?? 0;
  // The biggest centred crop of the frame's aspect that fits the image at the
  // current angle — the "zoomed all the way out" state and the zoom ceiling.
  const cover = coverForRotation(natural, aspect, deg);

  // Seed a default the first time we reach this size (crop is cleared whenever
  // the size or image changes, so this re-seeds correctly on a size change).
  useEffect(() => {
    if (hasCtx && !crop) setCrop(coverForRotation(natural, aspect, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCtx, crop, size?.id, image?.url]);

  if (!hasCtx) return null;

  const active = crop ?? cover;
  // Zoom is always offered — you can crop tighter into any image. Panning only
  // has somewhere to go once the crop is smaller than the canvas in some
  // direction: zoomed in, a shape mismatch, or any rotation all create that.
  const canPan = active.w < 0.999 || active.h < 0.999;

  // ── Rotate / zoom / pan ───────────────────────────────────────────
  const onRotate = (nextDeg: number) => {
    // Preserve how far the customer had zoomed, and roughly where they were
    // centred, then re-fit and clamp for the new angle.
    const oldCover = coverForRotation(natural, aspect, deg);
    const zoom = oldCover.w > 0 ? active.w / oldCover.w : 1;
    const cov = coverForRotation(natural, aspect, nextDeg);
    const w = cov.w * zoom;
    const h = cov.h * zoom;
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    setCrop(
      clampCrop(
        { x: cx - w / 2, y: cy - h / 2, w, h, rotation: nextDeg },
        natural,
      ),
    );
  };

  const onZoom = (val: number) => {
    // val = 1 is full cover (most zoomed out); smaller crops in around centre.
    const w = cover.w * val;
    const h = cover.h * val;
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    setCrop(
      clampCrop({ x: cx - w / 2, y: cy - h / 2, w, h, rotation: deg }, natural),
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canPan) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, crop: active };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    const start = drag.current.crop;
    // The window spans `start.w` of the canvas width, so a drag of dx pixels
    // moves the crop by (dx / windowWidth) * start.w in canvas fractions.
    setCrop(
      clampCrop(
        {
          ...start,
          x: start.x - (dx / rect.width) * start.w,
          y: start.y - (dy / rect.height) * start.h,
        },
        natural,
      ),
    );
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const zoomVal = cover.w > 0 ? active.w / cover.w : 1;

  // ── Preview geometry ──────────────────────────────────────────────
  // An SVG viewBox does all the scaling: it shows exactly the `active` window
  // of the rotated canvas, so no pixel measuring is needed and the preview
  // matches the baked print. The <image> sits centred in the canvas and is
  // turned about the canvas centre — the same order Cloudinary bakes.
  const canvas = rotatedCanvas(natural, deg);
  const vx = active.x * canvas.w;
  const vy = active.y * canvas.h;
  const vw = active.w * canvas.w;
  const vh = active.h * canvas.h;
  const imgX = (canvas.w - natural.w) / 2;
  const imgY = (canvas.h - natural.h) / 2;

  return (
    <div className="w-full">
      {/* Frame chrome mirrors FramedPreview so the crop window looks like the
          actual framed print, not a generic crop box. Inset is per-shape and
          the art sits flush — no white mat. */}
      <div
        className="mx-auto shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
        style={{
          background: frame!.gradient,
          padding: frameInset(frame!),
          maxWidth: 420,
        }}
      >
        <svg
          ref={windowRef}
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`block w-full bg-paper select-none ${
            canPan ? "cursor-grab active:cursor-grabbing touch-none" : ""
          }`}
        >
          <image
            href={image!.url}
            x={imgX}
            y={imgY}
            width={natural.w}
            height={natural.h}
            preserveAspectRatio="none"
            transform={`rotate(${deg} ${canvas.w / 2} ${canvas.h / 2})`}
            style={{ pointerEvents: "none" }}
          />
        </svg>
      </div>

      <div className="mx-auto mt-5 max-w-[420px] space-y-4">
        {/* Rotation is always available — it's the whole point for abstract
            work. Zoom and pan appear once there's room to move. */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-ink-soft font-semibold w-14 shrink-0">
            Rotate
          </span>
          <input
            type="range"
            min={ROT_MIN}
            max={ROT_MAX}
            step={1}
            value={deg}
            onChange={(e) => onRotate(Number(e.target.value))}
            aria-label="Rotate"
            className="flex-1 accent-ink"
          />
          <button
            type="button"
            onClick={() => onRotate(0)}
            disabled={deg === 0}
            className="text-[11px] tabular-nums text-ink-soft w-12 text-right hover:text-ink disabled:hover:text-ink-soft"
            aria-label="Reset rotation"
            title="Reset rotation"
          >
            {deg}°
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-ink-soft font-semibold w-14 shrink-0">
            Zoom
          </span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={1}
            step={0.01}
            value={zoomVal}
            onChange={(e) => onZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-ink"
          />
          <span className="w-12" />
        </div>

        {canPan ? (
          <p className="text-[12px] text-ink-soft leading-relaxed">
            Drag to reposition, rotate to taste. Anything outside the frame is
            trimmed from the print.
          </p>
        ) : (
          <p className="text-[12px] text-ink-soft leading-relaxed">
            Zoom in or rotate to taste — drag to reposition once there&apos;s
            room to move.
          </p>
        )}
      </div>
    </div>
  );
}
