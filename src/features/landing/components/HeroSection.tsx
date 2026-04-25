"use client";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const words = ["rental", "purchase", "dreams", "memories"];

export default function HeroSection() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8F4E3] flex items-center">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#C49C74"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-24 pb-16">
        {/* Left text */}
        <div className="flex flex-col gap-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase"
          >
            premier bridal boutique
          </motion.p>

          <TextGenerateEffect
            words="Your dream gown beautifully yours"
            className="text-4xl lg:text-5xl font-bold text-[#5B3E26] leading-tight"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-2 text-lg text-[#5B3E26]"
          >
            <span>Available for</span>
            <FlipWords words={words} className="text-[#A86A4B] font-medium" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-[#5B3E26]/80 leading-relaxed max-w-md"
          >
            Discover an exquisite collection of bridal gowns. <br />
            Every bride deserves to feel extraordinary on her most special day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-4 mt-2"
          >
            <Link href="/catalog">
              <button className="px-8 py-3 bg-[#A86A4B] text-white text-sm rounded-full hover:bg-[#5B3E26] transition-all duration-200 tracking-wide shadow-sm">
                Explore collection
              </button>
            </Link>
            <Link
              href="/booking"
              className="text-sm text-[#A86A4B] hover:text-[#5B3E26] transition-colors flex items-center gap-1"
            >
              Book a fitting <span>&rarr;</span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex gap-8 mt-4 pt-6 border-t border-[#D9C4A0]"
          >
            {[
              { num: "500+", label: "Gowns" },
              { num: "1,200+", label: "Happy brides" },
              { num: "10+", label: "Years" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-medium text-[#A86A4B]">{s.num}</p>
                <p className="text-xs text-[#C49C74] tracking-wide mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[560px] rounded-2xl overflow-hidden bg-[#E9D9B6]"
        >
          <Image
            src="https://res.cloudinary.com/dctbdkkrk/image/upload/v1777107158/hero-img_x3fw31.jpg"
            alt="Hero Image"
            fill
            className="object-cover"
          />

          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#A86A4B] opacity-40" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#A86A4B] opacity-40" />

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-6 left-6 bg-[#F8F4E3]/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#D9C4A0]"
          >
            <p className="text-xs text-[#A86A4B] tracking-wide">New arrivals</p>
            <p className="text-sm font-medium text-[#5B3E26]">
              Spring collection 2025
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-xs tracking-widest text-[#A86A4B] uppercase">
          Scroll to explore
        </p>
        <svg
          className="w-5 h-5 text-[#A86A4B]"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </div>
  );
}
