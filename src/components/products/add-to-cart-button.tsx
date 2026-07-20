"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

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
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = stock <= 0;

  function clamp(q: number) {
    if (q < 1) return 1;
    if (q > stock) return stock;
    return q;
  }

  function handleAdd() {
    if (outOfStock) return;
    addItem({ productId, name, image, size, unitPrice }, quantity);
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

        {!outOfStock && (
          <div className="flex items-center gap-1 rounded-full border border-border bg-background px-1 py-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => clamp(q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-medium text-foreground sm:text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => clamp(q + 1))}
              disabled={quantity >= stock}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted sm:flex-none sm:px-6 sm:py-3 sm:text-sm"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>

      {!outOfStock && stock <= 5 && (
        <p className="text-xs text-muted-foreground">Only {stock} left in stock</p>
      )}
    </div>
  );
}