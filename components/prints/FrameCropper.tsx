"use client";

import { useEffect, useRef } from "react";
import { useConfigurator } from "@/lib/store";
import { orientationOf } from "@/data/sizes";
import { targetAspect, defaultCrop, type Crop } from "@/lib/crop";

/** How far in the customer may zoom: crop shrinks to 40% of the cover size. */
const MIN_ZOOM = 0.4;

export default function FrameCropper() {
  const { image, frame, size, crop, setCrop } = useConfigurator();
  const windowRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);

  const hasCtx = !!(image && frame && size);
  const natural = image ? { w: image.width, h: image.height } : { w: 1, h: 1 };
  const orientation = orientationOf(image);
  const aspect = image && size ? targetAspect(size, orientation) : 1;
  // The biggest centred crop of the frame's aspect that fits the image. This is
  // the "zoomed all the way out" state and the ceiling for the zoom slider.
  const cover = defaultCrop(natural, aspect);

  // Seed a default the first time we reach this size (crop is cleared whenever
  // the size or image changes, so this re-seeds correctly on a size change).
  useEffect(() => {
    if (hasCtx && !crop) setCrop(cover);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCtx, crop, size?.id, image?.url]);

  if (!hasCtx) return null;

  const active = crop ?? cover;
  // Nothing to reposition when the image already matches the frame's shape.
  const canReposition = cover.w < 0.999 || cover.h < 0.999;

  const clamp = (c: Crop): Crop => ({
    w: c.w,
    h: c.h,
    x: Math.min(1 - c.w, Math.max(0, c.x)),
    y: Math.min(1 - c.h, Math.max(0, c.y)),
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canReposition) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, crop: active };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    const start = drag.current.crop;
    // The window spans `start.w` of the image's width, so a drag of dx pixels
    // moves the crop by (dx / windowWidth) * start.w in source fractions.
    setCrop(
      clamp({
        ...start,
        x: start.x - (dx / rect.width) * start.w,
        y: start.y - (dy / rect.height) * start.h,
      }),
    );
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onZoom = (val: number) => {
    // val = 1 is full cover (most zoomed out); smaller crops in around centre.
    const w = cover.w * val;
    const h = cover.h * val;
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    setCrop(clamp({ w, h, x: cx - w / 2, y: cy - h / 2 }));
  };

  const zoomVal = active.w / cover.w;

  return (
    <div className="w-full">
      {/* Frame chrome mirrors FramedPreview so the crop window looks like the
          actual framed print, not a generic crop box. */}
      <div
        className="mx-auto p-[18px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
        style={{ background: frame!.gradient, maxWidth: 420 }}
      >
        <div className="bg-white p-2">
          <div
            ref={windowRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={`relative overflow-hidden bg-paper ${
              canReposition
                ? "cursor-grab active:cursor-grabbing touch-none"
                : ""
            }`}
            style={{ aspectRatio: String(aspect) }}
          >
            <img
              src={image!.url}
              alt="Your print"
              draggable={false}
              className="absolute max-w-none select-none"
              style={{
                width: `${100 / active.w}%`,
                height: `${100 / active.h}%`,
                left: `${(-100 * active.x) / active.w}%`,
                top: `${(-100 * active.y) / active.h}%`,
              }}
            />
          </div>
        </div>
      </div>

      {canReposition && (
        <div className="mx-auto mt-5 max-w-[420px]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-ink-soft font-semibold">
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
          </div>
          <p className="text-[12px] text-ink-soft mt-2 leading-relaxed">
            Drag to reposition. Anything outside the frame is trimmed from the
            print.
          </p>
        </div>
      )}
    </div>
  );
}
