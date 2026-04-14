"use client";
import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
  rightSlot,
}: {
  navItems: { name: string; link: string }[];
  className?: string;
  rightSlot?: React.ReactNode;
}) => {
  const { scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    setScrolled(current > 0.03);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: scrolled ? 1 : 0,
        y: scrolled ? 0 : -20,
        pointerEvents: scrolled ? "auto" : "none",
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex max-w-fit fixed top-5 inset-x-0 mx-auto z-[5000] px-6 py-3 items-center justify-center gap-6 rounded-full border border-[#D9C4A0] bg-[#F8F4E3]/95 backdrop-blur-md shadow-md",
        className,
      )}
    >
      <span className="text-sm font-medium tracking-widest text-[#5B3E26] mr-1">
        BLANCHE <span className="text-[#A86A4B]">BRIDAL</span>
      </span>

      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.link}
            className="text-sm text-[#5B3E26] hover:text-[#A86A4B] transition-colors"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Right slot — Sign in link or avatar dropdown injected here */}
      <div className="ml-2">{rightSlot}</div>
    </motion.div>
  );
};
