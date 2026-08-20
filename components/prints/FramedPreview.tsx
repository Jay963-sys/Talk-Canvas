import type { Frame } from "@/data/frames";

interface Props {
  image: string;
  frame: Frame;
  maxWidth?: number;
}

// Rendered frame thickness in px. Floating reads as a thin lip; box is chunkier;
// antique (shape === null) is the most substantial. Preview-only — this never
// touches the printed file or the AR texture. Tune the numbers to taste.
export function frameInset(frame: Frame): number {
  if (frame.shape === "floating") return 6;
  if (frame.shape === "box") return 20;
  return 22; // antique
}

// Floating frames sit flat and thin on the wall, so they get a shallow shadow;
// box and antique are heavier objects and keep the deeper drop shadow. The
// shadow matters as much as the width for whether a frame reads as "floating"
// rather than a chunky box.
export function frameShadow(frame: Frame): string {
  if (frame.shape === "floating") return "0 8px 24px -12px rgba(0,0,0,0.35)";
  return "0 20px 60px -20px rgba(0,0,0,0.4), 0 8px 20px -8px rgba(0,0,0,0.3)";
}

export default function FramedPreview({ image, frame, maxWidth = 380 }: Props) {
  return (
    <div
      style={{
        background: frame.gradient,
        padding: frameInset(frame),
        maxWidth: `${maxWidth}px`,
        boxShadow: frameShadow(frame),
      }}
    >
      {/* Art sits flush against the frame — no white mat by default. */}
      <img src={image} alt="Your print" className="w-full block" />
    </div>
  );
}
