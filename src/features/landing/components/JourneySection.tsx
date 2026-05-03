"use client";

import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Book Fitting",
    description: "Schedule your private appointment with our bridal specialists.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14">
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M8 3v4M16 3v4M4 9h16"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M8 12h3v3H8v-3ZM13 12h3v3h-3v-3ZM8 16h3v2H8v-2ZM13 16h3v2h-3v-2Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Try Gowns",
    description: "Explore our curated collection in an intimate and relaxed setting.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14">
        <path
          d="M10 4h4l1 3-2 2 4 11H7l4-11-2-2 1-3Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M10 4c.6 1 1.2 1.5 2 1.5S13.4 5 14 4M8 20c1.4-3.2 2.7-6.4 4-11 1.3 4.6 2.6 7.8 4 11"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Customize",
    description: "Personalize every detail to create a gown that is uniquely yours.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14">
        <path
          d="M11 4h4l1 4-2 2v10H8V10L6 8l1-4h4Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M11 4c.5.9 1.2 1.4 2 1.4S14.5 4.9 15 4M8 20h6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M16 14l4-4M18 16l3-3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: "4",
    title: "Wedding Day",
    description: "Step into your moment with a gown as unforgettable as your love.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14">
        <path
          d="M12 20V9M12 9c-2.2-2.2-4.7-2.2-6.5-.5C4 10 4.5 12.5 7 13.5M12 9c2.2-2.2 4.7-2.2 6.5-.5C20 10 19.5 12.5 17 13.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M12 9c0-2.5 1.4-4.5 3-5M12 9C12 6.5 10.6 4.5 9 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M7 13.5c1.5.8 3.2.5 5-1.5 1.8 2 3.5 2.3 5 1.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
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
      <div className="pointer-events-none absolute inset-0 opacity-32">
        <Image
          src="https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548870/natural-bride_ukt10w.png"
          alt=""
          fill
          className="object-cover object-center blur-[1px]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-bridal-dark/82" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(207,167,125,0.18),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_25%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
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

          <p className="mx-auto mt-4 max-w-md font-jost text-xs font-medium leading-relaxed text-white/62 md:text-sm">
            A seamless, personalized experience designed to bring your dream
            bridal look to life.
          </p>
        </div>

        <div className="relative mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="group relative flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-bridal-gold/35 bg-white/[0.025] px-5 py-7 text-center backdrop-blur-sm transition-all duration-300 hover:border-bridal-gold/75 hover:shadow-[0_0_32px_rgba(207,167,125,0.12)] md:min-h-[280px]">
                <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-bridal-gold/55 font-cormorant text-xl font-semibold text-bridal-gold">
                  {step.number}
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-bridal-gold/15 text-bridal-gold/85 transition-colors duration-300 group-hover:border-bridal-gold/35 group-hover:text-bridal-gold">
                  {step.icon}
                </div>

                <h3 className="mt-6 font-cormorant text-2xl font-medium leading-tight text-white md:text-3xl">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-[190px] font-jost text-xs leading-relaxed text-white/58 md:text-sm">
                  {step.description}
                </p>
              </div>

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

        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="grid grid-cols-2 gap-y-7 divide-white/12 sm:grid-cols-4 sm:divide-x">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center px-2 text-center text-bridal-gold"
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