"use client";

import { useEffect, useState, type ReactNode } from "react";

// Lifestyle "in your space" gallery — see the brief from earlier in this
// thread for shot list/styling notes. 10 room shots in /public, each tile
// below rotates through the full set independently so the grid never feels
// like a synced slideshow.

const ROOMS = [
  { src: "/1.png", alt: "Framed print in a Lagos living room" },
  { src: "/2.png", alt: "Framed print above a console table" },
  { src: "/3.png", alt: "Small gallery wall grouping in a hallway" },
  { src: "/4.png", alt: "Framed print in a bedroom" },
  { src: "/5.png", alt: "Framed print in a reading nook" },
  { src: "/6.png", alt: "Framed print above a dining table" },
  { src: "/7.png", alt: "Framed print in a sunlit corner" },
  { src: "/8.png", alt: "Framed print in a minimalist study" },
  { src: "/9.png", alt: "Framed print beside a window" },
];

function RotatingTile({
  sequence,
  intervalMs,
}: {
  sequence: number[];
  intervalMs: number;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    // Increment our step in the custom sequence array
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % sequence.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, sequence.length]);

  // Safely grab the active index from our custom sequence
  const activeIndex = sequence[step] ?? 0;

  return (
    <div className="relative w-full aspect-[3/4] bg-paper overflow-hidden">
      {ROOMS.map((room, i) => (
        <img
          key={room.src}
          src={room.src}
          alt={room.alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out ${
            i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}
    </div>
  );
}

export default function RoomGallery({
  eyebrow = "On the wall",
  title = (
    <>
      See it in your <span className="display-italic">space</span>, not just on
      an easel.
    </>
  ),
}: {
  eyebrow?: string;
  title?: ReactNode;
}) {
  // Four slots, each following a completely scrambled, disjointed path through
  // the 9 images. This prevents the "chase effect" where one slot naturally
  // trails right behind another.
  const slots = [
    { sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8], intervalMs: 4200 },
    { sequence: [3, 6, 0, 8, 5, 2, 7, 1, 4], intervalMs: 5000 },
    { sequence: [6, 2, 8, 4, 1, 7, 3, 0, 5], intervalMs: 4600 },
    { sequence: [8, 5, 1, 7, 3, 0, 4, 6, 2], intervalMs: 5400 },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
      <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
        {eyebrow}
      </p>
      <h2 className="display text-3xl md:text-4xl font-normal mb-10 max-w-lg leading-[1.1]">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((slot, i) => (
          <RotatingTile key={i} {...slot} />
        ))}
      </div>
    </section>
  );
}
