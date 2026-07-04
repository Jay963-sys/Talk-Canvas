"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  FRAMES,
  type FrameStyle,
  type FrameShape,
  type Frame,
} from "@/data/frames";
import { isSizeAvailable } from "@/data/pricing";
import { useConfigurator } from "@/lib/store";

export default function StepFrame() {
  const { frame, glass, size, setFrame, setGlass, setSize } = useConfigurator();

  const [tab, setTab] = useState<FrameStyle>(frame?.style ?? "regular");
  const [shape, setShape] = useState<FrameShape>(
    frame?.style === "regular" ? frame.shape! : "floating",
  );

  const regularFrames = FRAMES.filter((f) => f.style === "regular");
  const antiqueFrames = FRAMES.filter((f) => f.style === "antique");

  // Select a frame, and drop the selected size if it isn't offered for this
  // frame + glass combination (e.g. antique isn't priced for small sizes),
  // so the summary never shows a size with a "—" total.
  const selectFrame = (f: Frame) => {
    setFrame(f);
    if (size && !isSizeAvailable(size, f, glass)) {
      setSize(null);
    }
  };

  const toggleGlass = () => {
    const next = !glass;
    setGlass(next);
    if (frame && size && !isSizeAvailable(size, frame, next)) {
      setSize(null);
    }
  };

  const switchTab = (newTab: FrameStyle) => {
    setTab(newTab);
    if (frame && frame.style !== newTab) setFrame(null);
  };

  const switchShape = (newShape: FrameShape) => {
    setShape(newShape);
    if (frame?.style === "regular" && frame.shape !== newShape) {
      const swap = regularFrames.find(
        (f) => f.shape === newShape && f.color === frame.color,
      );
      if (swap) selectFrame(swap);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="display text-3xl font-normal mb-8">Choose a frame</h2>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-line mb-8">
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
          <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-5">
            Shape
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
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

          <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-5">
            Color
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {regularFrames
              .filter((f) => f.shape === shape)
              .map((f) => (
                <ColorTile
                  key={f.id}
                  frame={f}
                  selected={frame?.id === f.id}
                  onClick={() => selectFrame(f)}
                />
              ))}
          </div>

          {shape === "box" && (
            <button
              onClick={toggleGlass}
              className="flex items-center gap-3 text-[14px] text-ink"
            >
              <span
                className={`w-5 h-5 border flex items-center justify-center transition-colors ${glass ? "bg-ink border-ink" : "border-ink-soft bg-transparent"}`}
              >
                {glass && <Check size={14} className="text-cream" />}
              </span>
              Add anti-reflective museum glass
            </button>
          )}
        </>
      )}

      {tab === "antique" && (
        <>
          <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-5">
            Color
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {antiqueFrames.map((f) => (
              <ColorTile
                key={f.id}
                frame={f}
                selected={frame?.id === f.id}
                onClick={() => selectFrame(f)}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-[14px] text-ink-soft">
            <span className="w-5 h-5 border border-ink bg-ink flex items-center justify-center">
              <Check size={14} className="text-cream" />
            </span>
            Anti-reflective museum glass is included with every antique frame.
          </div>

          <p className="text-[12px] text-ink-soft mt-4">
            Antique framing is available on medium sizes and larger.
          </p>
        </>
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
      className={`pb-3 text-[12px] uppercase tracking-widest font-medium transition-colors ${active ? "text-ink border-b border-ink" : "text-ink-soft hover:text-ink"}`}
    >
      {label}
    </button>
  );
}

function ShapeTile({ label, description, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 border transition-all text-left ${selected ? "border-ink bg-paper" : "border-line hover:border-ink/50"}`}
    >
      <p className="display text-xl mb-1">{label}</p>
      <p className="text-[12px] text-ink-soft">{description}</p>
    </button>
  );
}

function ColorTile({ frame, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-1 border transition-all ${selected ? "border-ink" : "border-line"}`}
    >
      <div className="aspect-square bg-paper mb-2 overflow-hidden">
        <img
          src={frame.photo}
          alt={frame.color}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-[11px] uppercase tracking-widest text-center font-medium capitalize py-1">
        {frame.color}
      </p>
    </button>
  );
}
