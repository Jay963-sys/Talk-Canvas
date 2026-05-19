"use client";

import { useEffect } from "react";

interface Props {
  src: string;
  alt?: string;
}

export default function ARViewer({ src, alt }: Props) {
  useEffect(() => {
    // Dynamic import — model-viewer is heavy and SSR-incompatible
    import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      src={src}
      alt={alt}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      environment-image="neutral"
      exposure="0.9"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    />
  );
}
