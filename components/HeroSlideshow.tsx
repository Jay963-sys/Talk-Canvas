"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// We've updated this to an array of objects so you can control the exact focal point of each image.
// 'object-top' pins the top of the image to the top of the screen.
// 'object-[center_20%]' means center horizontally, and push the focus 20% down from the top.
const HERO_IMAGES = [
  { src: "/2.png", position: "object-[center_25%]" },
  { src: "/5.png", position: "object-top" },
  { src: "/8.png", position: "object-[center_40%]" },
  { src: "/1.png", position: "object-[center_20%]" },
  { src: "/9.png", position: "object-top" },
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
    }, 5000);

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
            alt="Curated Gallery Wall"
            fill
            priority={i === 0}
            // We inject the custom position class here
            className={`object-cover ${img.position} brightness-[0.70] absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${visibilityClasses}`}
          />
        );
      })}
    </div>
  );
}
