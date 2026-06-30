"use client";

import { useEffect, useState, type ReactNode } from "react";

// A deterministic shuffle function. It generates a perfectly scrambled array
// of indices [0, 1, ..., N-1] based on a seed (the slot index). Because it uses
// predictable math instead of Math.random(), it prevents hydration errors while
// guaranteeing each slot takes a completely different path through the items.
function generateSequence(length: number, seed: number) {
  const seq = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = (i * 13 + seed * 7 + 3) % (i + 1);
    // Swap
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }
  return seq;
}

interface SlotProps {
  items: ReactNode[];
  sequence: number[];
  intervalMs: number;
}

function RotatingSlot({ items, sequence, intervalMs }: SlotProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    // Increment our step through the custom sequence array
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % sequence.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, sequence.length, items.length]);

  const activeIndex = sequence[step] ?? 0;

  return (
    <div className="grid">
      {items.map((item, i) => (
        <div
          key={i}
          // Stacking trick: put every item in the exact same CSS grid cell
          className="col-start-1 row-start-1 transition-opacity duration-[800ms] ease-in-out"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 10 : 0,
            // Prevent hidden links/cards from stealing clicks
            pointerEvents: i === activeIndex ? "auto" : "none",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

interface RotatingGridProps {
  items: ReactNode[];
  slotCount?: number;
  baseIntervalMs?: number;
  className?: string;
}

/**
 * Generic rotating grid — N visible slots, each independently cycling
 * through a larger item pool with a staggered start + interval so slots
 * never feel synced. Falls back to a static grid if the pool isn't bigger
 * than the slot count (rotation would be pointless / would just flicker
 * between the same items).
 */
export default function RotatingGrid({
  items,
  slotCount = 4,
  baseIntervalMs = 4200,
  className = "grid grid-cols-2 md:grid-cols-4 gap-4",
}: RotatingGridProps) {
  if (!items || items.length === 0) return null;

  // If we don't have enough items to rotate, just render a static grid
  if (items.length <= slotCount) {
    return (
      <div className={className}>
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    );
  }

  // Generate a distinctly scrambled sequence for each slot
  const slots = Array.from({ length: slotCount }, (_, i) => ({
    sequence: generateSequence(items.length, i + 1),
    intervalMs: baseIntervalMs + i * 400,
  }));

  return (
    <div className={className}>
      {slots.map((slot, i) => (
        <RotatingSlot key={i} items={items} {...slot} />
      ))}
    </div>
  );
}
