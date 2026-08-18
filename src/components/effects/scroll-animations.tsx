"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const wrapperAnimations = {
  "anim-fade-up": {
    from: { y: 40, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" },
  },
  "anim-fade-left": {
    from: { x: -60, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.9, ease: "power2.out" },
  },
  "anim-fade-right": {
    from: { x: 60, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.9, ease: "power2.out" },
  },
  "anim-scale-in": {
    from: { scale: 0.94, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
  },
} as const;

const letterAnimations = {
  "split-rise": {
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0, ease: "power2.out" },
    stagger: { each: 0.02, from: "start" as const },
  },
  "split-fade": {
    from: { opacity: 0 },
    to: { opacity: 1, ease: "power1.out" },
    stagger: { each: 0.02, from: "start" as const },
  },
} as const;

export function ScrollAnimations() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    Object.entries(wrapperAnimations).forEach(([className, config]) => {
      gsap.utils.toArray<HTMLElement>(`.${className}`).forEach((el) => {
        const anim = gsap.fromTo(el, config.from, {
          ...config.to,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
      });
    });

    const splitInstances: SplitType[] = [];

  Object.entries(letterAnimations).forEach(([className, config]) => {
    gsap.utils.toArray<HTMLElement>(`.${className}`).forEach((heading) => {
      const split = new SplitType(heading, { types: "chars" });
      splitInstances.push(split);

      const anim = gsap.fromTo(split.chars, config.from, {
        ...config.to,
        duration: 0.6,
        stagger: config.stagger,
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none play reverse",
        },
      });
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
    });
  });

    return () => {
      triggers.forEach((t) => t.kill());
      splitInstances.forEach((s) => s.revert());
    };
  }, []);

  return null;
}