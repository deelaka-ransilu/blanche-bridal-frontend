import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductTeaserCard } from "@/components/products/product-teaser-card";

export function ProductTeaserSection({
  eyebrow,
  title,
  blurb,
  viewAllHref,
  ctaLabel,
  products,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  viewAllHref: string;
  ctaLabel: string;
  products: Product[];
}) {
  const items = products.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#1A1A1A] p-5 dark:bg-card sm:p-7">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9c7c2]">
          {eyebrow}
        </p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-xs italic leading-relaxed text-[#c9c7c2] sm:text-sm">
          {blurb}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-4">
        {items.map((product) => (
          <ProductTeaserCard key={product.id} product={product} imageClassName="h-28 sm:h-32 lg:h-36" />
        ))}
      </div>

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