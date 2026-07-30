"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface LightboxPanel {
  imageUrl: string;
  width: number;
  height: number;
}

interface Props {
  panels: LightboxPanel[];
  /** Which panel to open on — the thumbnail the customer actually tapped. */
  startIndex?: number;
  onClose: () => void;
  /** Hand off to the configurator with the whole set selected. */
  onFrame: () => void;
  framing?: boolean;
  error?: string | null;
}

function large(url: string, width = 1600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

/** Below this, a horizontal drag reads as a scroll rather than a swipe. */
const SWIPE_PX = 48;

/**
 * The large view of a set, one panel at a time.
 *
 * A set tile can only ever show one panel at readable size, so this is the only
 * place a customer sees what they're actually buying before the configurator
 * asks them to choose a frame for all of it. Panels arrive already loaded from
 * the feed, so stepping through is instant — no spinner between pieces.
 */
export default function SetLightbox({
  panels,
  startIndex = 0,
  onClose,
  onFrame,
  framing = false,
  error = null,
}: Props) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), Math.max(panels.length - 1, 0)),
  );
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // A set that shrinks under us (a panel pulled while the view is open) would
  // otherwise leave the index pointing past the end.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(panels.length - 1, 0)));
  }, [panels.length]);

  const count = panels.length;
  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      // Wraps rather than dead-ends: with two or three panels, a disabled arrow
      // at each end is more friction than it's worth.
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, go]);

  // Warm the neighbours so a tap on "next" paints immediately.
  useEffect(() => {
    if (count < 2) return;
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = large(panels[(index + d + count) % count].imageUrl);
    }
  }, [index, count, panels]);

  if (!mounted || count === 0) return null;

  const panel = panels[index];

  const arrow =
    "flex items-center justify-center w-11 h-11 rounded-full border border-cream/30 text-cream hover:bg-cream hover:text-ink transition-colors shrink-0";

  const view = (
    <div
      className="fixed inset-x-0 top-0 z-[200] h-[100dvh] bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Set of ${count}, viewing piece ${index + 1}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header — position first, since "which piece am I looking at" is the
          whole question this view exists to answer. */}
      <div className="shrink-0 flex items-center justify-between px-5 md:px-8 py-4">
        <div className="text-cream">
          <p className="text-[11px] uppercase tracking-[0.15em] text-cream/60">
            Set of {count}
          </p>
          <p className="text-sm mt-0.5">
            Piece {index + 1} of {count}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex items-center justify-center w-10 h-10 rounded-full border border-cream/30 text-cream hover:bg-cream hover:text-ink transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Stage */}
      <div
        className="flex-1 min-h-0 flex items-center gap-3 md:gap-6 px-4 md:px-8"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {count > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous piece"
            className={arrow}
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        )}

        <div className="flex-1 min-w-0 h-full flex items-center justify-center">
          <img
            // Keyed so a swap doesn't leave the previous panel painted while
            // the next decodes — a real risk when panels are near-identical.
            key={panel.imageUrl}
            src={large(panel.imageUrl)}
            alt={`Piece ${index + 1} of ${count}`}
            width={panel.width}
            height={panel.height}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {count > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next piece"
            className={arrow}
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Footer — thumbnails double as the position indicator, so there's no
          separate row of dots competing with them. */}
      <div className="shrink-0 px-5 md:px-8 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {count > 1 && (
          <div className="flex justify-center gap-2 mb-4 overflow-x-auto">
            {panels.map((p, i) => (
              <button
                key={p.imageUrl}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Piece ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-14 w-14 shrink-0 overflow-hidden border transition-opacity ${
                  i === index
                    ? "border-cream opacity-100"
                    : "border-cream/25 opacity-55 hover:opacity-85"
                }`}
              >
                <img
                  src={large(p.imageUrl, 160)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-[12px] text-red-400 mb-3">{error}</p>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onFrame}
            disabled={framing}
            aria-busy={framing}
            className="inline-flex items-center justify-center gap-2 bg-cream text-ink px-8 py-3 text-sm uppercase tracking-[0.12em] hover:bg-accent hover:text-cream transition-colors disabled:opacity-60"
          >
            {framing && (
              <Loader2 className="animate-spin" size={16} strokeWidth={1.5} />
            )}
            Frame this set
          </button>
          <p className="text-[11px] text-cream/55 text-center">
            All {count} pieces take the same frame and size, and are sold
            together.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(view, document.body);
}
