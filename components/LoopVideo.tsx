"use client";

import { useEffect, useRef } from "react";

/**
 * A short clip that plays as a silent loop while it's on screen — like a GIF
 * at a fraction of the size. To keep data use down:
 *  - nothing downloads until the clip scrolls into view (preload="none"),
 *  - it pauses when scrolled away,
 *  - it stays still (press play) for visitors who have asked their device for
 *    reduced motion or data saving.
 * Controls stay on, so anyone can unmute, pause or replay.
 */
export default function LoopVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    if (reducedMotion || saveData) return;

    video.muted = true; // browsers only allow autoplay when muted

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      controls
      preload="none"
      poster={poster}
      aria-label={label}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
