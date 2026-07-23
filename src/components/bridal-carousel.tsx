"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookFittingButton } from "@/components/book-fitting-button";

const CARDS = [
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784425631/south-indian-bride_w2m8ym_wmudmw.png",
    caption: "The South Indian bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784425631/low-country-saree-bride_rcn8w0_qepazo.png",
    caption: "The low-country bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784425630/kandyan-bride_ngl3nq_snjink.png",
    caption: "The Kandyan bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784425629/muslim-bride_vgmtaf_gnrvah.png",
    caption: "The Muslim bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784425630/western-bride_xxvg2i_d4iq6k.png",
    caption: "The Western bride",
  },
];

const CARD_STYLE = [
  { size: "h-64 w-40 sm:h-72 sm:w-48 lg:h-80 lg:w-52", rotate: "-rotate-6", translate: "" },
  { size: "h-72 w-44 sm:h-80 sm:w-52 lg:h-[22rem] lg:w-56", rotate: "-rotate-3", translate: "" },
  { size: "h-80 w-52 sm:h-96 sm:w-60 lg:h-[26rem] lg:w-64", rotate: "rotate-0", translate: "-translate-y-4" },
  { size: "h-72 w-44 sm:h-80 sm:w-52 lg:h-[22rem] lg:w-56", rotate: "rotate-3", translate: "" },
  { size: "h-64 w-40 sm:h-72 sm:w-48 lg:h-80 lg:w-52", rotate: "rotate-6", translate: "" },
];

const FEATURED_INDEX = 2; // The Kandyan bride — centered card

export function BridalCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    );
  }

  useEffect(() => {
    const el = scrollerRef.current;
    const featuredCard = cardRefs.current[FEATURED_INDEX];
    if (el && featuredCard) {
      const scrollTo =
        featuredCard.offsetLeft -
        el.clientWidth / 2 +
        featuredCard.clientWidth / 2;
      el.scrollLeft = scrollTo;
    }
    updateScrollState();

    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function scrollByCard(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 130;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + 12) : cardWidth + 12,
      behavior: "smooth",
    });
  }

  return (
    <div className="py-8 sm:py-10">
      {/* Header — centered title only */}
      <div className="mb-4 text-center">
        <h2 className="split-rise font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
          Bridal collection
        </h2>
      </div>

      {/* Card row */}
      <div
        ref={scrollerRef}
        className="anim-scale-in flex snap-x snap-mandatory items-center gap-3 overflow-x-auto overflow-y-visible scroll-smooth px-2 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4 lg:justify-center lg:overflow-visible"
      >
        {CARDS.map((card, i) => {
          const style = CARD_STYLE[i];
          return (
            <div
              key={card.caption}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              className={`relative flex-shrink-0 snap-center overflow-hidden rounded-2xl bg-[#3a3733] shadow-xl transition-transform duration-300 hover:z-10 hover:!rotate-0 hover:scale-105 ${style.size} ${style.rotate} ${style.translate}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt={card.caption}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-center">
                <span className="text-[10px] font-medium uppercase tracking-wide text-white sm:text-xs">
                  {card.caption}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow controls */}
      <div className="my-4 flex justify-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          aria-label="Previous"
          disabled={!canScrollLeft}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          aria-label="Next"
          disabled={!canScrollRight}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* CTAs */}
      <div className="anim-fade-up mt-2 flex flex-wrap justify-center gap-2.5 lg:mt-0">
        <Link
          href="/gallery"
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 sm:text-sm"
        >
          Explore collection
        </Link>
        <BookFittingButton className="rounded-full border-2 border-foreground/25 px-5 py-2.5 text-xs font-medium text-foreground transition hover:border-foreground/40 hover:bg-card sm:text-sm" />
      </div>
    </div>
  );
}