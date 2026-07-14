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

export function ProductTeaserCard({
  product,
  imageClassName,
}: {
  product: Product;
  imageClassName?: string;
}) {
  const price =
    product.type === "DRESS"
      ? product.rentalPrice ?? product.purchasePrice
      : product.purchasePrice ?? product.rentalPrice;

  const priceLabel =
    product.type === "DRESS" && product.rentalPrice != null
      ? `${formatPrice(product.rentalPrice)} / rental`
      : price != null
        ? formatPrice(price)
        : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div
        className={`relative w-full overflow-hidden bg-muted ${
          imageClassName ?? "aspect-[3/4]"
        }`}
      >
        {product.firstImageUrl ? (
          <Image
            src={product.firstImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-foreground sm:text-sm">
          {product.name}
        </p>
        {priceLabel && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{priceLabel}</p>
        )}
      </div>
    </Link>
  );
}