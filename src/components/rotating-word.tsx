"use client";

import { useEffect, useState } from "react";

const WORDS = ["buy", "rent", "design"];
const FACE_WIDTH = 90; // px
const FACE_HEIGHT = 36; // px
// Distance from the prism's center axis to each face, so the triangle reads correctly
const RADIUS = FACE_WIDTH / (2 * Math.tan(Math.PI / 3)); // ~26px for an equilateral triangular prism

export function RotatingWord() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev - 120);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="relative inline-block align-middle"
      style={{
        width: FACE_WIDTH,
        height: FACE_HEIGHT,
        perspective: 400,
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(-${RADIUS}px) rotateX(${rotation}deg)`,
        }}
      >
        {WORDS.map((word, i) => (
          <span
            key={word}
            className="absolute inset-0 flex items-center justify-center rounded-md bg-primary font-bold text-primary-foreground"
            style={{
              width: FACE_WIDTH,
              height: FACE_HEIGHT,
              transform: `rotateX(${i * -120}deg) translateZ(${RADIUS}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}