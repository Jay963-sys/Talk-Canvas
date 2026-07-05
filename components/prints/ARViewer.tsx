"use client";

import { useEffect } from "react";

interface Props {
  src: string;
  iosSrc?: string;
  alt?: string;
  /**
   * Optional custom AR control. Pass a <button slot="ar-button"> to replace
   * model-viewer's small default AR glyph with a prominent, clearly-labelled
   * call to action. model-viewer only reveals it on AR-capable devices.
   */
  children?: React.ReactNode;
}

export default function ARViewer({ src, iosSrc, alt, children }: Props) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      src={src}
      ios-src={iosSrc}
      alt={alt}
      ar
      ar-modes="scene-viewer webxr quick-look"
      ar-placement="wall"
      ar-scale="fixed"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      environment-image="neutral"
      exposure="0.9"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      {children}
    </model-viewer>
  );
}
