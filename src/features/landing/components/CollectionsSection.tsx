"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api/products";
import { ProductSummary } from "@/types";

// ── Fallback hardcoded collections ────────────────────────────────────────────
const fallbackCollections = [
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

function formatPrice(product: ProductSummary): string {
  if (product.rentalPrice && product.purchasePrice) {
    return `From LKR ${product.rentalPrice.toLocaleString()}`;
  }
  if (product.rentalPrice) {
    return `LKR ${product.rentalPrice.toLocaleString()} / rental`;
  }
  if (product.purchasePrice) {
    return `LKR ${product.purchasePrice.toLocaleString()}`;
  }
  return "";
}

// ── Product card (real data) ──────────────────────────────────────────────────
function ProductCard({
  product,
  isActive,
  onClick,
}: {
  product: ProductSummary;
  isActive: boolean;
  onClick: () => void;
}) {
  const price = formatPrice(product);

  return (
    <Link
      href={`/catalog/${product.slug}`}
      onClick={onClick}
      className={`group relative h-[250px] min-w-[170px] overflow-hidden rounded-2xl border text-left transition-all duration-300 md:h-[330px] md:min-w-[220px] lg:h-[370px] lg:min-w-[230px] ${
        isActive
          ? "border-bridal-gold/80 shadow-[0_0_32px_rgba(207,167,125,0.16)]"
          : "border-bridal-gold/28 hover:border-bridal-gold/65"
      }`}
    >
      {product.firstImageUrl ? (
        <Image
          src={product.firstImageUrl}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 170px, (max-width: 1024px) 220px, 230px"
        />
      ) : (
        // Placeholder when no image
        <div className="absolute inset-0 bg-gradient-to-br from-bridal-gold/10 to-bridal-dark/40" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/22 to-transparent" />

      {/* Availability badge */}
      {!product.isAvailable && (
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-black/60 px-2 py-0.5 font-jost text-[0.48rem] font-bold uppercase tracking-[0.14em] text-white/60 backdrop-blur-sm">
            Unavailable
          </span>
        </div>
      )}

      {/* Hover CTA */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="border border-white/60 bg-black/30 px-4 py-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          View Gown
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-center md:p-5">
        <p className="font-jost text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white md:text-[0.72rem]">
          {product.name}
        </p>
        {product.category && (
          <p className="mt-1 font-cormorant text-xs italic text-white/70 md:text-sm">
            {product.category.name}
          </p>
        )}
        {price && (
          <p className="mt-1.5 font-jost text-[0.52rem] font-semibold text-bridal-gold/90">
            {price}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Fallback card (hardcoded) ─────────────────────────────────────────────────
function FallbackCard({
  col,
  isActive,
  onClick,
}: {
  col: (typeof fallbackCollections)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={col.href}
      onClick={onClick}
      className={`group relative h-[250px] min-w-[170px] overflow-hidden rounded-2xl border text-left transition-all duration-300 md:h-[330px] md:min-w-[220px] lg:h-[370px] lg:min-w-[230px] ${
        isActive
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
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative h-[250px] min-w-[170px] overflow-hidden rounded-2xl border border-bridal-gold/15 bg-white/[0.03] md:h-[330px] md:min-w-[220px] lg:h-[370px] lg:min-w-[230px]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-white/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
        <div className="mx-auto h-2 w-20 rounded-full bg-white/10" />
        <div className="mx-auto h-2 w-14 rounded-full bg-white/6" />
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function CollectionsSection() {
  const [active, setActive] = useState(0);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ size: 6, sort: "createdAt,desc" })
      .then((res) => setProducts(res.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const usingRealData = !loading && products.length > 0;

  return (
    <section
      id="collections"
      className="relative overflow-hidden bg-bridal-dark px-4 py-20 text-white md:px-8 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(207,167,125,0.16),transparent_34%),radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.06),transparent_28%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
              {usingRealData ? "Latest arrivals" : "Curated for every bride"}
            </p>

            <h2 className="mt-4 font-cormorant text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white">
              {usingRealData ? "New Arrivals" : "Our Collections"}
            </h2>

            <p className="mt-4 max-w-xl font-jost text-xs font-medium leading-relaxed text-white/70 md:text-sm">
              {usingRealData
                ? "Freshly added to our boutique. Be the first to wear something extraordinary."
                : "Timeless styles. Thoughtfully curated. Made for your moment."}
            </p>
          </div>

          <Monogram />
        </div>

        {/* Cards */}
        <div className="mt-10 md:mt-14">
          <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4 lg:justify-center">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : usingRealData
                ? products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isActive={index === active}
                      onClick={() => setActive(index)}
                    />
                  ))
                : fallbackCollections.map((col, index) => (
                    <FallbackCard
                      key={col.title}
                      col={col}
                      isActive={index === active}
                      onClick={() => setActive(index)}
                    />
                  ))}
          </div>
        </div>

        {/* View all link — only when showing real products */}
        {usingRealData && (
          <div className="mt-6 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 border border-bridal-gold/40 px-6 py-2.5 font-jost text-[0.58rem] font-bold uppercase tracking-[0.16em] text-bridal-gold transition-all duration-200 hover:bg-bridal-gold hover:text-white"
            >
              View All Gowns
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}