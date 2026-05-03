"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const collections = [
  {
    title: "WESTERN",
    description: "Timeless & Classic",
    href: "/catalog?collection=WESTERN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/western-bride_ixwagl.png",
  },
  {
    title: "KANDYAN",
    description: "Grace & Heritage",
    href: "/catalog?collection=KANDYAN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/kandyan-bride_qoq3nw.png",
  },
  {
    title: "SAREE",
    description: "Tradition Reimagined",
    href: "/catalog?collection=SAREE",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548870/low-country-saree-bride_hv69is.png",
  },
  {
    title: "MUSLIM",
    description: "Graceful & Refined",
    href: "/catalog?collection=MUSLIM",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/muslim-bride_bgv2vt.png",
  },
  {
    title: "INDIAN",
    description: "Rich in Tradition",
    href: "/catalog?collection=INDIAN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/indian-bride_xwyjge.png",
  },
];

const features = [
  {
    title: "Curated Styles",
    text: "Handpicked with love",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
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
    title: "Premium Craftsmanship",
    text: "Detail in every stitch",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M7 4l10 16M17 4L7 20M5 7h14M5 17h14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Timeless Elegance",
    text: "For every moment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M4 8l4-4h8l4 4-8 12L4 8Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M4 8h16M8 4l4 16 4-16"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function Monogram() {
  return (
    <div className="hidden md:flex h-20 w-14 items-center justify-center rounded-full border border-bridal-gold/45 bg-white/[0.03] text-bridal-gold">
      <div className="text-center">
        <span className="block font-cormorant text-4xl font-semibold leading-none">
          B
        </span>
        <span className="mx-auto mt-1 block h-px w-5 bg-bridal-gold/40" />
      </div>
    </div>
  );
}

export default function CollectionsSection() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="collections"
      className="relative overflow-hidden bg-bridal-dark px-4 py-20 text-white md:px-8 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(207,167,125,0.16),transparent_34%),radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.06),transparent_28%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
              Curated for every bride
            </p>

            <h2 className="mt-4 font-cormorant text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white">
              Our Collections
            </h2>

            <p className="mt-4 max-w-xl font-jost text-xs font-medium leading-relaxed text-white/70 md:text-sm">
              Timeless styles. Thoughtfully curated. Made for your moment.
            </p>
          </div>

          <Monogram />
        </div>

        <div className="mt-10 md:mt-14">
          <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4 lg:justify-center">
            {collections.map((col, index) => (
              <Link
                key={col.title}
                href={col.href}
                onClick={() => setActive(index)}
                className={`group relative h-[250px] min-w-[170px] overflow-hidden rounded-2xl border text-left transition-all duration-300 md:h-[330px] md:min-w-[220px] lg:h-[370px] lg:min-w-[230px] ${
                  active === index
                    ? "border-bridal-gold/80 shadow-[0_0_32px_rgba(207,167,125,0.16)]"
                    : "border-bridal-gold/28 hover:border-bridal-gold/65"
                }`}
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 170px, (max-width: 1024px) 220px, 230px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/22 to-transparent" />

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="border border-white/60 bg-black/30 px-4 py-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    View Collection
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 text-center md:p-5">
                  <p className="font-jost text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white md:text-[0.72rem]">
                    {col.title}
                  </p>
                  <p className="mt-1 font-cormorant text-xs italic text-white/70 md:text-sm">
                    {col.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-8">
          <div className="grid grid-cols-3 divide-x divide-white/12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center px-2 text-center text-bridal-gold"
              >
                <div className="mb-3 text-bridal-gold/85">{feature.icon}</div>

                <p className="font-jost text-[0.48rem] font-bold uppercase tracking-[0.12em] text-white md:text-[0.62rem]">
                  {feature.title}
                </p>

                <p className="mt-1 hidden font-cormorant text-xs italic text-white/45 sm:block">
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