"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

const testimonials = [
  {
    name: "Amara Perera",
    location: "Colombo",
    collection: "Kandyan Collection",
    quote:
      "From the moment I stepped in, I felt truly seen. My gown was everything I dreamed of — and more.",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/kandyan-bride_qoq3nw.png",
    objectPos: "object-[60%_12%]",
  },
  {
    name: "Nadia Fernando",
    location: "Piliyandala",
    collection: "Western Collection",
    quote:
      "The attention to detail is unmatched. I felt like the most beautiful version of myself on my wedding day.",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/western-bride_ixwagl.png",
    objectPos: "object-[65%_10%]",
  },
  {
    name: "Priya Jayasinghe",
    location: "Nugegoda",
    collection: "Saree Collection",
    quote:
      "Every fitting felt personal and unhurried. They understood exactly the look I wanted without me having to explain twice.",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548870/low-country-saree-bride_hv69is.png",
    objectPos: "object-[55%_8%]",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const total = testimonials.length;

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return;
      setFading(true);
      setTimeout(() => {
        setActive(index);
        setFading(false);
      }, 280);
    },
    [active]
  );

  const next = useCallback(() => goTo((active + 1) % total), [active, goTo, total]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const current = testimonials[active];

  return (
    <section
      id="testimonials"
      className="relative flex h-svh flex-col overflow-hidden bg-bridal-dark text-white"
    >
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(207,167,125,0.10),transparent_55%)]" />

      {/* ── Top label bar ── */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/8 px-6 py-4 md:px-12">
        <p className="font-jost text-[0.56rem] font-bold uppercase tracking-[0.32em] text-bridal-gold">
          Kind Words
        </p>

        {/* Counter */}
        <p className="font-cormorant text-base italic text-white/30">
          <span className="text-white/60">
            {String(active + 1).padStart(2, "0")}
          </span>
          &nbsp;/&nbsp;{String(total).padStart(2, "0")}
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">

        {/* Left — Quote block */}
        <div className="flex flex-1 flex-col justify-between px-6 py-8 md:px-12 md:py-10 lg:py-12 lg:pr-0">
          {/* Section heading — left-aligned, no ornament */}
          <h2 className="font-cormorant text-[clamp(1.6rem,3.5vw,2.4rem)] font-medium leading-tight tracking-[-0.04em] text-white/40">
            Brides&apos; Experiences
          </h2>

          {/* The big quote */}
          <div
            className={`my-auto transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
          >
            <span className="mb-2 block font-cormorant text-[4rem] leading-none text-bridal-gold/50 md:text-[5rem]">
              &ldquo;
            </span>

            <p className="font-cormorant text-[clamp(1.6rem,4vw,3rem)] font-medium italic leading-[1.2] tracking-[-0.02em] text-white">
              {current.quote}
            </p>

            <div className="mt-8 flex items-center gap-5">
              <div className="h-px w-8 bg-bridal-gold/50" />
              <div>
                <p className="font-jost text-[0.65rem] font-bold uppercase tracking-[0.2em] text-bridal-gold">
                  {current.name}
                </p>
                <p className="mt-1 font-cormorant text-sm italic text-white/40">
                  {current.collection} &middot; {current.location}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Testimonial from ${t.name}`}
                className={`h-px rounded-full transition-all duration-400 ${
                  i === active
                    ? "w-10 bg-bridal-gold"
                    : "w-4 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}

            {/* Arrow controls */}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={() => goTo((active - 1 + total) % total)}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-200 hover:border-bridal-gold/50 hover:text-bridal-gold"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-200 hover:border-bridal-gold/50 hover:text-bridal-gold"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right — Portrait (hidden on mobile, shown on lg) */}
        <div className="relative hidden w-[38%] shrink-0 lg:block xl:w-[34%]">
          {/* Portrait fades between brides */}
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={t.image}
                alt={t.name}
                fill
                className={`object-cover ${t.objectPos}`}
                sizes="38vw"
              />
            </div>
          ))}

          {/* Left-side gradient blend into dark bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-bridal-dark via-bridal-dark/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bridal-dark/60 via-transparent to-bridal-dark/20" />
        </div>

        {/* Mobile portrait strip — thin bar below quote on small screens */}
        <div
          className={`relative h-[22svh] shrink-0 overflow-hidden lg:hidden transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <Image
            src={current.image}
            alt={current.name}
            fill
            className={`object-cover ${current.objectPos}`}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bridal-dark/60 via-transparent to-bridal-dark/80" />
        </div>
      </div>
    </section>
  );
}