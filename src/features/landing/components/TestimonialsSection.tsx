"use client";

import { useState, useEffect, useCallback } from "react";

const testimonials = [
  {
    name: "Amara Perera",
    location: "Colombo",
    collection: "Kandyan Collection",
    rating: 5,
    quote:
      "From the moment I stepped in, I felt truly seen. My gown was everything I dreamed of — and more.",
  },
  {
    name: "Nadia Fernando",
    location: "Piliyandala",
    collection: "Western Collection",
    rating: 5,
    quote:
      "The attention to detail is unmatched. I felt like the most beautiful version of myself on my wedding day.",
  },
  {
    name: "Priya Jayasinghe",
    location: "Nugegoda",
    collection: "Saree Collection",
    rating: 5,
    quote:
      "Every fitting felt personal and unhurried. They understood exactly the look I wanted without me having to explain twice.",
  },
  {
    name: "Dilki Ratnayake",
    location: "Kandy",
    collection: "Kandyan Collection",
    rating: 5,
    quote:
      "A once-in-a-lifetime experience. The team made sure every detail was perfect. I could not have asked for more.",
  },
  {
    name: "Shalini Mendis",
    location: "Galle",
    collection: "Indian Collection",
    rating: 5,
    quote:
      "The craftsmanship is extraordinary. My guests could not stop complimenting the gown throughout the evening.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          fill="none"
          className={`h-3 w-3 ${i < rating ? "text-bridal-gold" : "text-white/15"}`}
        >
          <path
            d="M6 1l1.2 3.6H11L8.1 6.9l1.1 3.5L6 8.5l-3.2 1.9 1.1-3.5L1 4.6h3.8L6 1Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

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

  const next = useCallback(
    () => goTo((active + 1) % total),
    [active, goTo, total]
  );

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const current = testimonials[active];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-bridal-dark px-4 py-20 text-white md:px-8 md:py-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(207,167,125,0.10),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">

        {/* Section label */}
        <div className="mb-12 flex items-center justify-between md:mb-16">
          <div>
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
              Kind Words
            </p>
            <h2 className="mt-3 font-cormorant text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
              Brides&apos; Experiences
            </h2>
          </div>

          {/* Counter */}
          <p className="hidden font-cormorant text-lg italic text-white/25 md:block">
            <span className="text-white/50">{String(active + 1).padStart(2, "0")}</span>
            &nbsp;/&nbsp;{String(total).padStart(2, "0")}
          </p>
        </div>

        {/* Main quote */}
        <div
          className={`transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          {/* Opening quote mark */}
          <span className="block font-cormorant text-[5rem] leading-none text-bridal-gold/30 md:text-[7rem]">
            &ldquo;
          </span>

          {/* Quote text */}
          <p className="mt-2 max-w-4xl font-cormorant text-[clamp(1.6rem,4vw,3rem)] font-medium italic leading-[1.25] tracking-[-0.02em] text-white md:mt-4">
            {current.quote}
          </p>

          {/* Attribution */}
          <div className="mt-8 flex items-center gap-5 md:mt-10">
            <div className="h-px w-10 bg-bridal-gold/50 shrink-0" />
            <div>
              <div className="flex items-center gap-3">
                <p className="font-jost text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bridal-gold">
                  {current.name}
                </p>
                <StarRating rating={current.rating} />
              </div>
              <p className="mt-1 font-cormorant text-sm italic text-white/40">
                {current.collection} &middot; {current.location}
              </p>
            </div>
          </div>
        </div>

        {/* All testimonial cards — mini previews */}
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 md:mt-16">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => goTo(i)}
              className={`group rounded-xl border p-4 text-left transition-all duration-300 ${
                i === active
                  ? "border-bridal-gold/60 bg-white/[0.06] shadow-[0_0_24px_rgba(207,167,125,0.10)]"
                  : "border-white/8 bg-white/[0.02] hover:border-bridal-gold/30 hover:bg-white/[0.04]"
              }`}
            >
              <StarRating rating={t.rating} />
              <p
                className={`mt-2 font-cormorant text-sm italic leading-snug transition-colors duration-200 ${
                  i === active ? "text-white/80" : "text-white/35 group-hover:text-white/55"
                }`}
              >
                &ldquo;{t.quote.slice(0, 55)}…&rdquo;
              </p>
              <p
                className={`mt-2 font-jost text-[0.52rem] font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
                  i === active ? "text-bridal-gold" : "text-white/25 group-hover:text-bridal-gold/60"
                }`}
              >
                {t.name}
              </p>
            </button>
          ))}
        </div>

        {/* Navigation controls */}
        <div className="mt-8 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Testimonial from ${t.name}`}
                className={`h-px rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-10 bg-bridal-gold"
                    : "w-4 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goTo((active - 1 + total) % total)}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-200 hover:border-bridal-gold/50 hover:text-bridal-gold"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-200 hover:border-bridal-gold/50 hover:text-bridal-gold"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}