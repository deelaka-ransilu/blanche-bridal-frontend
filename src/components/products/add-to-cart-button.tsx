"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

export function AddToCartButton({
  productId,
  name,
  image,
  unitPrice,
  sizes,
  stock,
}: {
  productId: string;
  name: string;
  image: string | null;
  unitPrice: number;
  sizes: string[];
  stock: number;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [added, setAdded] = useState(false);

  const outOfStock = stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem({ productId, name, image, size, unitPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-1 flex-col gap-2 sm:flex-none">
      <div className="flex flex-1 items-center gap-2 sm:flex-none">
        {sizes.length > 0 && (
          <select
            value={size ?? ""}
            onChange={(e) => setSize(e.target.value)}
            disabled={outOfStock}
            className="rounded-full border border-border bg-background px-3 py-2.5 text-xs disabled:opacity-50 sm:py-3"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted sm:flex-none sm:px-6 sm:py-3 sm:text-sm"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          onClick={() => {
            if (outOfStock) return;
            handleAdd();
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="hidden whitespace-nowrap rounded-full border border-primary px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted-foreground disabled:hover:bg-transparent sm:inline-flex sm:px-6 sm:py-3 sm:text-sm"
        >
          Buy now
        </button>
      </div>

      {!outOfStock && stock <= 5 && (
        <p className="text-xs text-muted-foreground">Only {stock} left in stock</p>
      )}
    </div>
  );
}