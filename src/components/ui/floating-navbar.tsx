"use client";
import React, { useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    setScrolled(current > 0.03);
    if (current <= 0.03) setMenuOpen(false);
  });

  return (
    <div className="fixed top-5 inset-x-0 mx-auto z-[5000] flex flex-col items-center w-fit">
      {/* Same pill — design unchanged */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: scrolled ? 1 : 0,
          y: scrolled ? 0 : -20,
          pointerEvents: scrolled ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex max-w-fit px-6 py-3 items-center justify-center gap-6 rounded-full border border-[#D9C4A0] bg-[#F8F4E3]/95 backdrop-blur-md shadow-md",
          className,
        )}
      >
        {/* Desktop nav links — unchanged */}
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

        {/* Mobile hamburger — only visible on small screens */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-1 text-[#5B3E26] hover:text-[#A86A4B] transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Right slot — unchanged */}
        <div className="ml-2">{rightSlot}</div>
      </motion.div>

      {/* Mobile dropdown — drops below the pill */}
      <AnimatePresence>
        {menuOpen && scrolled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 w-48 rounded-2xl border border-[#D9C4A0] bg-[#F8F4E3]/98 backdrop-blur-md shadow-lg overflow-hidden"
          >
            {navItems.map((item, i) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-5 py-3 text-sm text-[#5B3E26] hover:bg-[#EDE4D0] hover:text-[#A86A4B] transition-colors",
                  i !== navItems.length - 1 && "border-b border-[#E8DCCA]",
                )}
              >
                {item.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
