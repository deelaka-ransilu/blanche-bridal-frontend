"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useEffect, useState } from "react";

export function CartIcon() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.totalItems);

  // Prevent hydration mismatch — don't render count until client has mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? totalItems() : 0;

  return (
    <button
      onClick={toggleCart}
      className="relative p-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-md"
      aria-label={`Shopping cart, ${count} items`}
    >
      <ShoppingBag className="w-5 h-5" />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
