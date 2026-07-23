"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRIDAL_IMAGES } from "@/lib/bridal-images";

// --- Customize here ---
const DISPLAY_DURATION = 3000;   // ms each image stays fully visible
const TRANSITION_DURATION = 300; // ms the transition effect takes — must match duration-XXX below
const TRANSITION_OUT_CLASSES = "opacity-0 -translate-x-8"; // swipe left
const TRANSITION_IN_CLASSES = "opacity-100 translate-x-0";
// -----------------------

export function HeroRotatingImage() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % BRIDAL_IMAGES.length);
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, DISPLAY_DURATION);
    return () => clearInterval(interval);
  }, []);

  const current = BRIDAL_IMAGES[index];

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-xl">
      <Image
        src={current.src}
        alt={current.caption}
        fill
        priority
        className={`object-cover transition-all duration-300 ${
          isTransitioning ? TRANSITION_OUT_CLASSES : TRANSITION_IN_CLASSES
        }`}
      />
    </div>
  );
}