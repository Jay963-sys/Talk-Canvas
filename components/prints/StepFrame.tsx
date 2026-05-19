"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  FRAMES,
  type FrameStyle,
  type FrameShape,
  type Frame,
} from "@/data/frames";
import { useConfigurator } from "@/lib/store";

export default function StepFrame() {
  const { frame, glass, setFrame, setGlass } = useConfigurator();

  // Tab state derived from current selection, defaulting to "regular"
  const [tab, setTab] = useState<FrameStyle>(frame?.style ?? "regular");
  // Shape state (regular only) — preserved across tab switches
  const [shape, setShape] = useState<FrameShape>(
    frame?.style === "regular" ? frame.shape! : "floating",
  );

  const regularFrames = FRAMES.filter((f) => f.style === "regular");
  const antiqueFrames = FRAMES.filter((f) => f.style === "antique");

  const switchTab = (newTab: FrameStyle) => {
    setTab(newTab);
    // If current frame isn't in new tab, clear it
    if (frame && frame.style !== newTab) setFrame(null);
  };

  const switchShape = (newShape: FrameShape) => {
    setShape(newShape);
    // If user has a regular frame selected, swap to same color in new shape
    if (frame?.style === "regular" && frame.shape !== newShape) {
      const swap = regularFrames.find(
        (f) => f.shape === newShape && f.color === frame.color,
      );
      if (swap) setFrame(swap);
    }
  };

  const visibleColors =
    tab === "regular"
      ? regularFrames.filter((f) => f.shape === shape)
      : antiqueFrames;

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Choose a frame</h2>
      <p className="text-sm text-ink-soft mb-6">
        Hand-finished frames in two styles. Glass available on box frames only.
      </p>

      {/* Style tabs */}
      <div className="flex border-b border-line mb-8">
        <TabButton
          label="Regular"
          active={tab === "regular"}
          onClick={() => switchTab("regular")}
        />
        <TabButton
          label="Antique"
          active={tab === "antique"}
          onClick={() => switchTab("antique")}
        />
      </div>

      {tab === "regular" && (
        <>
          {/* Shape */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              Shape
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ShapeTile
                label="Floating"
                description="Modern, minimal profile"
                selected={shape === "floating"}
                onClick={() => switchShape("floating")}
              />
              <ShapeTile
                label="Box"
                description="Deeper profile, glass optional"
                selected={shape === "box"}
                onClick={() => switchShape("box")}
              />
            </div>
          </div>

          {/* Color */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
              Color
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {visibleColors.map((f) => (
                <ColorTile
                  key={f.id}
                  frame={f}
                  selected={frame?.id === f.id}
                  onClick={() => setFrame(f)}
                />
              ))}
            </div>
          </div>

          {/* Glass toggle — Box only */}
          {shape === "box" && (
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
                Glass
              </p>
              <button
                onClick={() => setGlass(!glass)}
                className={`w-full p-5 border-[1.5px] flex items-center gap-3 text-left transition-all ${
                  glass
                    ? "border-ink bg-paper"
                    : "border-line hover:border-ink-soft"
                }`}
              >
                <span
                  className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
                    glass ? "bg-ink border-ink" : "border-muted bg-cream"
                  }`}
                >
                  {glass && (
                    <Check size={14} strokeWidth={2.5} className="text-cream" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">
                    Add anti-reflective museum glass
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Protects the print. Adds to the price.
                  </p>
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {tab === "antique" && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
            Color
          </p>
          <div className="grid grid-cols-2 gap-3">
            {visibleColors.map((f) => (
              <ColorTile
                key={f.id}
                frame={f}
                selected={frame?.id === f.id}
                onClick={() => setFrame(f)}
              />
            ))}
          </div>
          <p className="text-xs text-muted mt-4 italic">
            Antique frames include anti-reflective glass and are available in
            sizes 24 × 48 in and up.
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-1 mr-8 text-sm font-medium transition-colors ${
        active
          ? "border-b-2 border-ink text-ink -mb-px"
          : "text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function ShapeTile({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 border-[1.5px] text-left transition-all ${
        selected
          ? "border-ink bg-paper"
          : "border-line hover:border-ink-soft bg-cream"
      }`}
    >
      <p className="display-italic text-xl">{label}</p>
      <p className="text-xs text-muted mt-1">{description}</p>
    </button>
  );
}

function ColorTile({
  frame,
  selected,
  onClick,
}: {
  frame: Frame;
  selected: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`block border-[1.5px] overflow-hidden transition-all ${
        selected ? "border-ink" : "border-line hover:border-ink-soft"
      }`}
    >
      <div className="aspect-square">
        {!imgError ? (
          <img
            src={frame.photo}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: frame.gradient }}
          />
        )}
      </div>
      <div className="p-2.5 bg-cream">
        <p className="text-xs font-medium capitalize">{frame.color}</p>
      </div>
    </button>
  );
}
