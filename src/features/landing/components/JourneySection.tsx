"use client";

import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Book Fitting",
    description: "Schedule your private appointment with our bridal specialists.",
    image: "https://res.cloudinary.com/dexuqaeuf/image/upload/q_auto/f_auto/v1777973164/book-fitting_ehdeea.png",
    href: "/booking",
  },
  {
    number: "2",
    title: "Try Gowns",
    description: "Explore our curated collection in an intimate and relaxed setting.",
    image: "https://res.cloudinary.com/dexuqaeuf/image/upload/q_auto/f_auto/v1777973165/try-gowns_vov0e1.png",
    href: "/catalog",
  },
  {
    number: "3",
    title: "Customize",
    description: "Personalize every detail to create a gown that is uniquely yours.",
    image: "https://res.cloudinary.com/dexuqaeuf/image/upload/q_auto/f_auto/v1777973164/customize_vwvdej.png",
    href: "/inquiry",
  },
  {
    number: "4",
    title: "Wedding Day",
    description: "Step into your moment with a gown as unforgettable as your love.",
    image: "https://res.cloudinary.com/dexuqaeuf/image/upload/q_auto/f_auto/v1777973165/wedding-day_lkkus3.png",
    href: "/booking",
  },
];

const features = [
  {
    title: "Personalized Care",
    text: "Dedicated to you",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <path
          d="M12 3l1.4 2.4 2.7-.7.7 2.7L19.2 9 17.8 12l1.4 3-2.4 1.6-.7 2.7-2.7-.7L12 21l-1.4-2.4-2.7.7-.7-2.7L4.8 15 6.2 12 4.8 9l2.4-1.6.7-2.7 2.7.7L12 3Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "Exceptional Quality",
    text: "Timeless craftsmanship",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <path
          d="M12 20c-4-3-7-6.5-7-11 3.5.3 5.8 2 7 5 1.2-3 3.5-4.7 7-5 0 4.5-3 8-7 11Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M12 14V4M8 7l4-3 4 3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Curated Elegance",
    text: "Selected with love",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <path
          d="M12 3v18M7 7c0 2.2 2 4 5 4s5-1.8 5-4M6 17c0-2.2 2.7-4 6-4s6 1.8 6 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "Unforgettable Moments",
    text: "Cherished forever",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <path
          d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9L8.4 14l.7-4-2.9-2.8 4-.6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function JourneySection() {
  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-bridal-dark px-4 py-20 text-white md:px-8 md:py-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(207,167,125,0.14),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
            Your Experience
          </p>
          <h2 className="mt-3 font-cormorant text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
            Bridal Journey
          </h2>
          <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-3">
            <span className="h-px flex-1 bg-bridal-gold/45" />
            <span className="text-bridal-gold">✽</span>
            <span className="h-px flex-1 bg-bridal-gold/45" />
          </div>
          <p className="mx-auto mt-4 max-w-md font-jost text-xs font-medium leading-relaxed text-white/55 md:text-sm">
            A seamless, personalized experience designed to bring your dream
            bridal look to life.
          </p>
        </div>

        {/* Step cards */}
        <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Link
                href={step.href}
                className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-bridal-gold/25 transition-all duration-500 hover:border-bridal-gold/70 hover:shadow-[0_0_40px_rgba(207,167,125,0.15)] md:min-h-[380px]"
              >
                {/* Background image */}
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Dark overlay — lightens slightly on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 transition-opacity duration-500 group-hover:opacity-85" />

                {/* Step number badge */}
                <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-bridal-gold/60 bg-black/40 font-cormorant text-xl font-semibold text-bridal-gold backdrop-blur-sm">
                  {step.number}
                </div>

                {/* Content — sits at bottom */}
                <div className="relative mt-auto p-5 md:p-6">
                  <h3 className="font-cormorant text-2xl font-semibold leading-tight text-white md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-jost text-[0.7rem] leading-relaxed text-white/60 md:text-xs">
                    {step.description}
                  </p>

                  {/* CTA — appears on hover */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-gold">
                      Learn more
                    </span>
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-bridal-gold">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Connector between cards */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1 text-bridal-gold lg:flex">
                  <span className="h-px w-4 bg-bridal-gold/35" />
                  <span className="text-sm">✦</span>
                  <span className="h-px w-4 bg-bridal-gold/35" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features strip */}
        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="grid grid-cols-2 gap-y-7 divide-white/12 sm:grid-cols-4 sm:divide-x">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center px-2 text-center"
              >
                <div className="mb-3 text-bridal-gold/85">{feature.icon}</div>
                <p className="font-jost text-[0.48rem] font-bold uppercase tracking-[0.12em] text-white md:text-[0.62rem]">
                  {feature.title}
                </p>
                <p className="mt-1 font-cormorant text-xs italic text-white/45">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}