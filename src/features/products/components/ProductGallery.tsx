"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
        No images available
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={activeImage.url}
          alt={`${productName} — image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-200"
          priority
        />
      </div>

      {/* Thumbnail strip — only shown when more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                i === activeIndex
                  ? "border-amber-500 ring-1 ring-amber-400"
                  : "border-transparent hover:border-amber-300"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
