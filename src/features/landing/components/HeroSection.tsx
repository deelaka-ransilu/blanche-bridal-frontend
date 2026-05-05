"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const HERO_IMAGE =
  "https://res.cloudinary.com/dexuqaeuf/image/upload/q_auto/f_auto/v1777624488/hero-image_vksc24.png";

const CARD_CALCULATIONS = {
  dragThreshold: 40,
};

const bridalCards = [
  {
    title: "WESTERN",
    subtitle: "Timeless & Classic",
    href: "/catalog?collection=WESTERN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/western-bride_ixwagl.png",
  },
  {
    title: "KANDYAN",
    subtitle: "Grace & Heritage",
    href: "/catalog?collection=KANDYAN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/kandyan-bride_qoq3nw.png",
  },
  {
    title: "SAREE",
    subtitle: "Tradition Reimagined",
    href: "/catalog?collection=SAREE",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548870/low-country-saree-bride_hv69is.png",
  },
  {
    title: "MUSLIM",
    subtitle: "Graceful & Refined",
    href: "/catalog?collection=MUSLIM",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/muslim-bride_bgv2vt.png",
  },
  {
    title: "INDIAN",
    subtitle: "Rich in Tradition",
    href: "/catalog?collection=INDIAN",
    image:
      "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777548872/indian-bride_xwyjge.png",
  },
];

function Monogram() {
  return (
    <div className="hidden sm:flex h-14 w-11 items-center justify-center rounded-full border border-bridal-gold/45 bg-white/20 text-bridal-gold backdrop-blur-sm md:h-16 md:w-12">
      <div className="text-center">
        <span className="block font-cormorant text-3xl font-semibold leading-none">
          B
        </span>
        <span className="mx-auto mt-1 block h-px w-5 bg-bridal-gold/40" />
      </div>
    </div>
  );
}

function CollectionCard({
  card,
  isActive,
  onClick,
}: {
  card: (typeof bridalCards)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={card.href}
      onClick={onClick}
      className={`group relative h-[245px] min-w-[165px] overflow-hidden rounded-2xl border text-left transition-all duration-300 sm:h-[275px] sm:min-w-[185px] lg:h-[310px] lg:min-w-[205px] xl:h-[325px] xl:min-w-[215px] ${
        isActive
          ? "border-bridal-gold/75 shadow-[0_0_30px_rgba(207,167,125,0.18)]"
          : "border-bridal-gold/25 hover:border-bridal-gold/60"
      }`}
    >
      <Image
        src={card.image}
        alt={`${card.title} bridal look`}
        fill
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 165px, (max-width: 1024px) 185px, 215px"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-transparent" />

      {/* Hover CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="border border-white/60 bg-black/30 px-3 py-1.5 font-jost text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          View Collection
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p className="font-jost text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white sm:text-[0.68rem]">
          {card.title}
        </p>
        <p className="mt-1 font-cormorant text-sm italic text-white/70">
          {card.subtitle}
        </p>
      </div>
    </Link>
  );
}

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const dragStart = useRef<number | null>(null);
  const total = bridalCards.length;

  const next = useCallback(() => {
    setActive((current) => (current + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActive((current) => (current - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const diff = e.clientX - dragStart.current;
    if (Math.abs(diff) > CARD_CALCULATIONS.dragThreshold) {
      if (diff < 0) next();
      else prev();
    }
    dragStart.current = null;
  };

  return (
    <section className="h-[100svh] overflow-hidden bg-bridal-bg font-jost text-bridal-text">
      {/* Top half — offset by nav height (56px = h-14) so hero still fills screen */}
      <div className="relative h-[50svh] overflow-hidden bg-[#f7efe4]">
        <Image
          src={HERO_IMAGE}
          alt="Bride wearing a white wedding gown"
          fill
          priority
          className="object-cover object-[72%_18%] sm:object-[70%_20%] md:object-[68%_24%] lg:object-[72%_24%]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#f7efe4]/95 via-[#f7efe4]/72 to-[#f7efe4]/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7efe4]/45 via-transparent to-[#f7efe4]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,255,255,0.75),transparent_34%)]" />

        {/* Hero copy — full height of top half */}
        <div className="relative z-10 mx-auto grid h-full max-w-[1200px] items-center px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="mb-3 font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
              Designed for your story
            </p>

            <h1 className="font-cormorant text-[clamp(2.9rem,7vw,5.7rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-bridal-text">
              Find your
              <br />
              dream gown
            </h1>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="#collections"
                className="inline-flex items-center justify-center bg-bridal-gold px-7 py-3 font-jost text-[0.58rem] font-bold uppercase tracking-[0.12em] text-white transition-opacity duration-300 hover:opacity-85"
              >
                Browse collections
              </a>

              <Link
                href="/booking"
                className="inline-flex items-center justify-center border border-bridal-gold/45 bg-white/20 px-7 py-3 font-jost text-[0.58rem] font-bold uppercase tracking-[0.12em] text-bridal-gold transition-colors duration-300 hover:bg-bridal-gold hover:text-white"
              >
                Book appointment
              </Link>
            </div>
          </div>

          <div className="hidden justify-end pr-4 md:flex">
            <Monogram />
          </div>
        </div>
      </div>

      {/* Bottom half */}
      <div className="relative h-[50svh] bg-bridal-dark px-4 py-3 text-white md:px-8 md:py-4">
        <div className="mx-auto flex h-full max-w-[1200px] flex-col">
          <div className="shrink-0 text-center">
            <p className="font-jost text-[0.5rem] font-bold uppercase tracking-[0.26em] text-bridal-gold md:text-[0.58rem]">
              Celebrating every tradition
            </p>

            <h2 className="mt-1 font-cormorant text-[clamp(1.25rem,2.5vw,1.9rem)] font-medium leading-tight text-white/90">
              Brides. Cultures. Timeless Beauty.
            </h2>

            <div className="mx-auto mt-1.5 flex max-w-xs items-center justify-center gap-3">
              <span className="h-px flex-1 bg-bridal-gold/35" />
              <span className="text-bridal-gold">✦</span>
              <span className="h-px flex-1 bg-bridal-gold/35" />
            </div>
          </div>

          <div className="relative mt-3 min-h-0 flex-1">
            <div
              className="flex h-full items-center gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              {bridalCards.map((card, index) => (
                <CollectionCard
                  key={card.title}
                  card={card}
                  isActive={index === active}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}