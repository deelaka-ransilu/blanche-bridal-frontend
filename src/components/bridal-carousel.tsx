"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookFittingButton } from "@/components/book-fitting-button";

const CARDS = [
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/south-indian-bride_w2m8ym.png",
    caption: "The South Indian bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/low-country-saree-bride_rcn8w0.png",
    caption: "The low-country bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624459/kandyan-bride_ngl3nq.png",
    caption: "The Kandyan bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/muslim-bride_vgmtaf.png",
    caption: "The Muslim bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624461/western-bride_xxvg2i.png",
    caption: "The Western bride",
  },
];

export function BridalCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
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
    updateScrollState();
    const el = scrollerRef.current;
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
    <div className="rounded-3xl bg-[#1A1A1A] p-5 sm:p-7 dark:bg-card">
      {/* Header row: caption left, title right — vertically centered on mobile/tablet */}
      <div className="mb-4 flex flex-row items-center justify-between gap-3 sm:items-end">
        <p className="max-w-[9rem] text-xs italic leading-relaxed text-[#c9c7c2] sm:max-w-xs sm:text-sm">
          From timeless lace to modern silhouettes, celebrating every
          tradition a bride can bring to her day.
        </p>
        <h2 className="font-heading text-right text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Bridal collection
        </h2>
      </div>

      {/* Card row — scrolls on mobile + tablet, static 5-up only at lg+ */}
      <div
        ref={scrollerRef}
        className="flex items-center gap-4 overflow-x-auto overflow-y-visible scroll-smooth px-2 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 lg:justify-center lg:overflow-visible"
      >
        {CARDS.map((card, i) => {
          // The Kandyan bride is always the featured/raised card,
          // regardless of where it sits in the array.
          const isFeatured = card.caption === "The Kandyan bride";
          const mid = (CARDS.length - 1) / 2;
          const tilt = (i - mid) * 2.5;
          const lift = isFeatured ? "lg:-translate-y-3" : "";

          return (
            <div
              key={card.caption}
              style={{ transform: `rotate(${tilt}deg)` }}
              className={`relative h-52 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-[#3a3733] shadow-xl transition-transform duration-300 hover:z-10 hover:!rotate-0 hover:scale-105 sm:h-60 sm:w-40 lg:h-72 lg:w-48 ${
                isFeatured ? "z-10 h-60 sm:h-64 lg:h-80" : ""
              } ${lift}`}
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

      {/* Arrow controls — mobile + tablet only, disabled at scroll ends */}
      <div className="my-4 flex justify-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          aria-label="Previous"
          disabled={!canScrollLeft}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5a5650] text-[#c9c7c2] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          aria-label="Next"
          disabled={!canScrollRight}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5a5650] text-[#c9c7c2] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* CTAs */}
      <div className="mt-2 flex justify-center gap-2.5 lg:mt-0">
        <Link
          href="/products"
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 sm:text-sm"
        >
          Explore collection
        </Link>
        <BookFittingButton className="rounded-full border border-[#6b6862] px-5 py-2.5 text-xs font-medium text-[#e8e6e1] transition hover:bg-white/10 sm:text-sm" />
      </div>
    </div>
  );
}