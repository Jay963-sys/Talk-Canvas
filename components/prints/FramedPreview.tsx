import type { Frame } from "@/data/frames";
import { thumb } from "@/lib/cloudinaryLoader";

interface Props {
  image: string;
  frame: Frame;
  maxWidth?: number;
}

export function frameInset(frame: Frame): number {
  if (frame.shape === "floating") return 6;
  if (frame.shape === "box") return 20;
  return 22;
}

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
      <img
        src={thumb(image, 1200)}
        alt="Your print"
        className="w-full block"
      />{" "}
    </div>
  );
}
