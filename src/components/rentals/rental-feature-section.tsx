import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriceLabel(product: Product) {
  const price =
    product.type === "DRESS"
      ? product.rentalPrice ?? product.purchasePrice
      : product.purchasePrice ?? product.rentalPrice;

  return product.type === "DRESS" && product.rentalPrice != null
    ? `${formatPrice(product.rentalPrice)} / rental`
    : price != null
      ? formatPrice(price)
      : null;
}

interface RentalFeatureSectionProps {
  eyebrow?: string;
  title: string;
  blurb?: string;
  viewAllHref: string;
  ctaLabel?: string;
  products: Product[];
}

export function RentalFeatureSection({
  eyebrow,
  title,
  blurb,
  viewAllHref,
  ctaLabel = "View all",
  products,
}: RentalFeatureSectionProps) {
  const [hero] = products;
  if (!hero) return null;

  const heroPriceLabel = getPriceLabel(hero);

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#1A1A1A] p-5 sm:p-7 dark:bg-card">
      <div className="mb-4">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-[#c9c7c2]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        {blurb && (
          <p className="mt-2 text-xs italic leading-relaxed text-[#c9c7c2] sm:text-sm">
            {blurb}
          </p>
        )}
      </div>

      <Link
        href={`/products/${hero.slug}`}
        className="group relative block h-56 w-full flex-1 overflow-hidden rounded-2xl bg-[#3a3733] sm:h-64 lg:h-72"
      >
        {hero.firstImageUrl ? (
          <Image
            src={hero.firstImageUrl}
            alt={hero.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
          <p className="font-heading text-lg font-medium text-white sm:text-xl">
            {hero.name}
          </p>
          {heroPriceLabel && (
            <p className="mt-1 text-xs text-[#e8e6e1] sm:text-sm">
              {heroPriceLabel}
            </p>
          )}
        </div>
      </Link>

      <div className="mt-auto flex justify-center pt-5">
        <Link
          href={viewAllHref}
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 sm:text-sm"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}