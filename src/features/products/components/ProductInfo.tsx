"use client";

import { ProductDetail } from "@/types";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { selectedSize, setSelectedProduct, setSelectedSize } =
    useProductStore();

  const { addItem, openCart } = useCartStore();

  // Register this product in the store when the component mounts
  useEffect(() => {
    setSelectedProduct(product.id);
  }, [product.id, setSelectedProduct]);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasRental = product.rentalPrice != null;
  const hasPurchase = product.purchasePrice != null;
  const isAvailable = product.isAvailable && product.stock > 0;

  // Size required but none selected yet
  const needsSize = hasSizes && !selectedSize;

  function handleAddToCart() {
    addItem(product, selectedSize ?? undefined);
    openCart();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Type badge + name */}
      <div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {product.type === "DRESS" ? "Dress" : "Accessory"}
        </span>
        {product.category && (
          <span className="ml-2 text-xs text-muted-foreground">
            {product.category.name}
          </span>
        )}
        <h1 className="mt-3 text-2xl font-semibold text-gray-900 leading-snug">
          {product.name}
        </h1>

        {/* Average rating summary */}
        {product.averageRating != null && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= Math.round(product.averageRating!)
                      ? "text-amber-400 text-sm"
                      : "text-gray-200 text-sm"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.averageRating.toFixed(1)} · {product.reviews.length}{" "}
              {product.reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Pricing */}
      <div className="flex flex-col gap-1.5">
        {hasRental && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground w-20">Rental</span>
            <span className="text-xl font-semibold text-amber-700">
              LKR {product.rentalPrice!.toLocaleString()}
            </span>
          </div>
        )}
        {hasPurchase && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground w-20">Purchase</span>
            <span
              className={`${hasRental ? "text-base text-gray-600" : "text-xl font-semibold text-amber-700"}`}
            >
              LKR {product.purchasePrice!.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-sm text-gray-700">
              {product.stock} in stock
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            <span className="text-sm text-gray-400">Out of stock</span>
          </>
        )}
      </div>

      {/* Size selector */}
      {hasSizes && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Size</p>
            {selectedSize ? (
              <span className="text-xs text-amber-700 font-medium">
                {selectedSize} selected
              </span>
            ) : (
              <span className="text-xs text-gray-400">Select a size</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() =>
                  setSelectedSize(selectedSize === size ? null : size)
                }
                className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  selectedSize === size
                    ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-400"
                    : "border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1.5">Details</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Add to cart */}
      <div className="pt-1">
        <Button
          onClick={handleAddToCart}
          disabled={!isAvailable || needsSize}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {!isAvailable
            ? "Out of stock"
            : needsSize
              ? "Select a size first"
              : "Add to cart"}
        </Button>

        {/* Helper text only when a size is still needed */}
        {isAvailable && needsSize && (
          <p className="text-xs text-amber-600 text-center mt-2">
            Please select a size to continue.
          </p>
        )}
      </div>
    </div>
  );
}
