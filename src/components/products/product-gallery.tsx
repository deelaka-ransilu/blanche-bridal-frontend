"use client";

import { useState } from "react";
import type { ProductImage } from "@/types/product";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const [active, setActive] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-primary/8 sm:h-full sm:aspect-auto">
        <span className="text-sm text-muted-foreground">Image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:h-full sm:flex-row">
      {/* Main image: taller fixed aspect ratio on mobile, fills column height from sm: up */}
      <div className="order-1 aspect-[3/4] w-full flex-1 overflow-hidden rounded-2xl bg-primary/8 sm:order-2 sm:aspect-auto sm:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sorted[active].url}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails: horizontal scroll row under the image on mobile, vertical rail beside it from sm: up */}
      {sorted.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === active
                  ? "border-primary shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${productName} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}