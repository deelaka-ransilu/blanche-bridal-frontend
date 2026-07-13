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
  return (
    <div className="rounded-3xl bg-[#1A1A1A] p-5 dark:bg-card sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9c7c2]">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm italic leading-relaxed text-[#c9c7c2]">
            {blurb}
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="hidden shrink-0 self-start rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:block"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:-mx-7 sm:px-7">
        <div className="flex gap-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="w-40 shrink-0 sm:w-48"
              style={{
                transform: i % 2 === 0 ? "rotate(-1.5deg)" : "rotate(1.5deg)",
              }}
            >
              <ProductTeaserCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <Link
        href={viewAllHref}
        className="mt-6 block rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10 sm:hidden"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}