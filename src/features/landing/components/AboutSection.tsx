"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  "Personalised one-on-one styling consultations",
  "Professional in-house alteration service",
  "Flexible rental and purchase options",
  "Accurate bridal measurement tracking",
  "Expert team with 10+ years of experience",
];

const stats = [
  { value: "500+", label: "Brides dressed" },
  { value: "10+",  label: "Years of expertise" },
  { value: "5",    label: "Traditions celebrated" },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-bridal-bg px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      {/* Subtle radial warm glow top-right */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(207,167,125,0.12),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* ── Left — image ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative h-[420px] overflow-hidden rounded-2xl bg-[#e9d9b6] md:h-[520px]">
              <Image
                src="https://res.cloudinary.com/dctbdkkrk/image/upload/v1777107404/botqiue-image_gijczn.jpg"
                alt="Blanche Bridal atelier interior"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bridal-dark/20 via-transparent to-transparent" />

              {/* Corner bracket accents */}
              <div className="absolute left-4 top-4 h-10 w-10 border-l-2 border-t-2 border-bridal-gold/50" />
              <div className="absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-bridal-gold/50" />
            </div>

            {/* Floating stat badge */}
            <div className="absolute -bottom-6 -right-2 flex flex-col items-center justify-center rounded-2xl border border-bridal-gold/30 bg-bridal-dark px-6 py-5 shadow-[0_20px_50px_rgba(23,16,12,0.25)] md:-right-6">
              <span className="font-cormorant text-4xl font-semibold leading-none text-bridal-gold md:text-5xl">
                500+
              </span>
              <span className="mt-1 font-jost text-[0.52rem] font-bold uppercase tracking-[0.22em] text-white/60">
                Brides dressed
              </span>
            </div>
          </motion.div>

          {/* ── Right — content ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col gap-6 pt-6 lg:pt-0"
          >
            {/* Eyebrow */}
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
              Our Story
            </p>

            {/* Heading */}
            <h2 className="font-cormorant text-[clamp(2.6rem,5vw,4.2rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-bridal-text">
              Where every bride
              <br />
              finds her{" "}
              <em className="italic text-bridal-gold">moment.</em>
            </h2>

            {/* Gold divider */}
            <div className="flex items-center gap-3 max-w-[160px]">
              <span className="h-px flex-1 bg-bridal-gold/35" />
              <span className="text-bridal-gold text-xs">✦</span>
              <span className="h-px flex-1 bg-bridal-gold/35" />
            </div>

            {/* Pull quote */}
            <p className="font-cormorant text-xl italic leading-relaxed text-bridal-text/70 md:text-2xl">
              &ldquo;Every gown we carry is chosen to make you feel radiant,
              confident, and unforgettable.&rdquo;
            </p>

            {/* Body */}
            <p className="font-jost text-sm leading-relaxed text-bridal-text/70 md:text-[0.9rem]">
              Located near Jayani Communication in Piliyandala, Blanche Bridal
              has been the trusted destination for brides across the Western
              Province — celebrating every tradition, from Kandyan ceremonies to
              Western chapel weddings.
            </p>

            {/* Feature list */}
            <ul className="flex flex-col gap-2.5 mt-1">
              {features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="flex items-center gap-3 font-jost text-sm text-bridal-text/75"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bridal-gold" />
                  {f}
                </motion.li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="mt-2 grid grid-cols-3 gap-4 border-t border-bridal-gold/20 pt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="font-cormorant text-3xl font-semibold leading-none text-bridal-text md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="font-jost text-[0.52rem] font-bold uppercase tracking-[0.16em] text-bridal-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 border border-bridal-gold/50 px-7 py-3 font-jost text-[0.6rem] font-bold uppercase tracking-[0.16em] text-bridal-gold transition-all duration-200 hover:bg-bridal-gold hover:text-white"
              >
                Browse our collection
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}