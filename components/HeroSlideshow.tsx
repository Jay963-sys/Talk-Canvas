"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Each slide carries its own focal point per breakpoint. These are wide
// landscape shots, so on a tall phone `object-cover` crops the sides hard —
// the mobile focal point keeps the key artwork in frame, and desktop (light
// crop) resets to centered. Class strings are written out in full so
// Tailwind's JIT can see them.
const HERO_IMAGES = [
  {
    src: "/97.jpg",
    alt: "Talk Canvas gallery hall with framed contemporary prints",
    position: "object-[55%_center] md:object-center",
  },
  {
    src: "/98.jpg",
    alt: "Talk Canvas showroom with paintings on easels and the reception desk",
    position: "object-center",
  },
  {
    src: "/99.jpg",
    alt: "Talk Canvas lounge with a statement triptych and seating",
    position: "object-[45%_center] md:object-center",
  },
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(HERO_IMAGES.length - 1);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % HERO_IMAGES.length;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-ink">
      {HERO_IMAGES.map((img, i) => {
        let visibilityClasses = "opacity-0 -z-10";

        if (i === currentIndex) {
          visibilityClasses = "opacity-100 z-10";
        } else if (i === prevIndex) {
          visibilityClasses = "opacity-100 z-0";
        }

        return (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            quality={90}
            className={`object-cover ${img.position} brightness-[0.70] absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${visibilityClasses}`}
          />
        );
      })}
    </div>
  );
}
