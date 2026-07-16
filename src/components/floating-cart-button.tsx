"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart-drawer";

// Cart only matters on the Buy path — Rent and Custom Design & Gallery are
// non-cart flows (admin handles fittings/consultations directly). Rather
// than a permanent nav icon, the cart surfaces as a floating button only
// where it's actually relevant, and opens an in-page drawer (no dedicated
// /cart route anymore).
const CART_VISIBLE_PREFIXES = ["/products", "/checkout"];

export function FloatingCartButton() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const visible = CART_VISIBLE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        className={`fixed top-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 ${
          count > 0 ? "animate-pulse-glow" : ""
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}