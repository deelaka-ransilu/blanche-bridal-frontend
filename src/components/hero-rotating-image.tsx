"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRIDAL_IMAGES } from "@/lib/bridal-images";

export function HeroRotatingImage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % BRIDAL_IMAGES.length);
    }, 3000);
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
        className="object-cover"
      />
    </div>
  );
}