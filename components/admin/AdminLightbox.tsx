"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function full(url: string, width = 1600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

/** Below this, a horizontal drag reads as a scroll rather than a swipe. */
const SWIPE_PX = 48;

interface Props {
  /** One image, or every panel of a set in hanging order. */
  images: string[];
  startIndex?: number;
  /** Shown above the counter — e.g. "Set of 3". */
  label?: string;
  onClose: () => void;
}

/**
 * Full-size preview for the admin grid.
 *
 * Takes an array rather than a single url so a set can be stepped through in
 * place: checking that three panels actually belong together is the one job
 * that's impossible from thumbnails, and it's the reason staff open this at
 * all. A single image passes an array of one and the arrows disappear.
 */
export default function AdminLightbox({
  images,
  startIndex = 0,
  label,
  onClose,
}: Props) {
  const count = images.length;
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)),
  );
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
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

  // Warm the neighbours so stepping through doesn't flash empty.
  useEffect(() => {
    if (count < 2) return;
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = full(images[(index + d + count) % count]);
    }
  }, [index, count, images]);

  if (count === 0) return null;

  const arrow =
    "flex items-center justify-center w-11 h-11 rounded-full bg-cream/90 text-ink hover:bg-cream shrink-0 disabled:opacity-40";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={label ? `${label} preview` : "Design preview"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-4">
        <div className="text-cream text-sm">
          {label && (
            <span className="uppercase tracking-[0.15em] text-[11px] text-cream/60 mr-3">
              {label}
            </span>
          )}
          {count > 1 && (
            <span className="tabular-nums">
              {index + 1} of {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-cream/90 text-ink hover:bg-cream"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div
        className="flex-1 min-h-0 flex items-center gap-3 px-4 pb-6"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // Keyed so a near-identical panel doesn't linger while the next
            // one decodes — the exact case staff are trying to tell apart.
            key={images[index]}
            src={full(images[index])}
            alt=""
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
    </div>,
    document.body,
  );
}
