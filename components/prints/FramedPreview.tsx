import type { Frame } from "@/data/frames";

interface Props {
  image: string;
  frame: Frame;
  maxWidth?: number;
}

// Rendered frame thickness in px. Floating reads as a thin lip; box is chunkier;
// antique (shape === null) is the most substantial. Preview-only — this never
// touches the printed file or the AR texture. Tune the three numbers to taste.
export function frameInset(frame: Frame): number {
  if (frame.shape === "floating") return 11;
  if (frame.shape === "box") return 20;
  return 22; // antique
}

export default function FramedPreview({ image, frame, maxWidth = 380 }: Props) {
  return (
    <div
      className="shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
      style={{
        background: frame.gradient,
        padding: frameInset(frame),
        maxWidth: `${maxWidth}px`,
      }}
    >
      {/* Art sits flush against the frame — no white mat. */}
      <img src={image} alt="Your print" className="w-full block" />
    </div>
  );
}
