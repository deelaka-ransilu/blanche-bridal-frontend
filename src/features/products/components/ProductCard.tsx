"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { ProductSummary } from "@/types";
import { useCartStore } from "@/stores/cartStore";

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const price = product.rentalPrice ?? product.purchasePrice;
  const priceLabel = product.rentalPrice ? "Rental from" : "From";
  const isAvailable = product.isAvailable && product.stock > 0;

  function handleAddToCart(e: React.MouseEvent) {
    // Stop the click bubbling up to the Link
    e.preventDefault();
    e.stopPropagation();

    // Build a minimal ProductDetail-compatible object from summary data
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        type: product.type,
        rentalPrice: product.rentalPrice,
        purchasePrice: product.purchasePrice,
        stock: product.stock,
        isAvailable: product.isAvailable,
        firstImageUrl: product.firstImageUrl,
        images: product.firstImageUrl
          ? [{ id: "0", url: product.firstImageUrl, displayOrder: 0 }]
          : [],
        sizes: [],
        reviews: [],
        category: product.category,
      },
      undefined, // no size selected from catalog view
    );
    openCart();
  }

  return (
    <Link href={`/catalog/${product.slug}`} className="group block">
      <div className="rounded-xl overflow-hidden border bg-white hover:shadow-md hover:border-amber-300 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {product.firstImageUrl ? (
            <Image
              src={product.firstImageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 text-amber-700 border border-amber-200">
              {product.type === "DRESS" ? "Dress" : "Accessory"}
            </span>
            {!isAvailable && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/80 text-white">
                Out of stock
              </span>
            )}
          </div>

          {/* Quick add button — appears on hover */}
          {isAvailable && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 truncate">
            {product.name}
          </p>
          {product.category && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.category.name}
            </p>
          )}
          {price != null && (
            <p className="text-xs text-amber-700 font-medium mt-1">
              {priceLabel} LKR {price.toLocaleString()}
            </p>
          )}
          {product.averageRating != null && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-500 text-xs">
                {"★".repeat(Math.round(product.averageRating))}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.averageRating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
