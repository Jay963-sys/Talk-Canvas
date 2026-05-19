import type { Frame } from "@/data/frames";

interface Props {
  image: string;
  frame: Frame;
  maxWidth?: number;
}

export default function FramedPreview({ image, frame, maxWidth = 380 }: Props) {
  return (
    <div
      className="p-[18px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
      style={{ background: frame.gradient, maxWidth: `${maxWidth}px` }}
    >
      <div className="bg-white p-2">
        <img src={image} alt="Your print" className="w-full block" />
      </div>
    </div>
  );
}
