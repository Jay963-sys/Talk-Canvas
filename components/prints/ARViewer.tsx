"use client";

import { useEffect } from "react";

interface Props {
  src: string;
  iosSrc?: string;
  alt?: string;
}

export default function ARViewer({ src, iosSrc, alt }: Props) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      src={src}
      ios-src={iosSrc}
      alt={alt}
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-placement="wall"
      ar-scale="fixed"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      environment-image="neutral"
      exposure="0.9"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    />
  );
}
