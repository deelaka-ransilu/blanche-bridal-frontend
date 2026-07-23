"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const snap = new Snap(lenis, {
      type: "mandatory",
      duration: 1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    const sections = document.querySelectorAll("main section[data-snap]");
    sections.forEach((section) => {
      snap.addElement(section as HTMLElement, { align: ["start"] });
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      snap.destroy();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}