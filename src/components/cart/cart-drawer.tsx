"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { checkCartStockAction, type CartStockInfo } from "@/lib/actions/cart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { status } = useSession();
  const { items, updateQuantity, removeItem, total } = useCart();

  const [stockInfo, setStockInfo] = useState<Record<string, CartStockInfo>>({});
  const [checkingStock, setCheckingStock] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (items.length === 0) {
      setCheckingStock(false);
      return;
    }
    setCheckingStock(true);
    checkCartStockAction(items.map((i) => i.productId))
      .then(setStockInfo)
      .finally(() => setCheckingStock(false));
  }, [open, items]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const onCheckoutClick = () => {
    onClose();
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/my/checkout-redirect");
      return;
    }
    router.push("/checkout");
  };

  const hasBlockingIssue = items.some((item) => {
    const info = stockInfo[item.productId];
    if (!info) return false;
    return !info.available || info.stock < item.quantity;
  });

  function lineIssue(item: (typeof items)[number]): string | null {
    const info = stockInfo[item.productId];
    if (!info) return null;
    if (!info.found || !info.available) return "No longer available";
    if (info.stock < item.quantity) {
      return info.stock === 0
        ? "Out of stock"
        : `Only ${info.stock} left — reduce quantity`;
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our accessories to add something to your cart.
              </p>
            </div>
            <Link href="/products" onClick={onClose}>
              <Button className="text-white">Browse accessories</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const issue = lineIssue(item);
                return (
                  <div
                    key={`${item.productId}-${item.size ?? "default"}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        LKR {item.unitPrice.toLocaleString()}
                      </p>
                      {issue && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          {issue}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              {hasBlockingIssue && (
                <p className="mb-3 text-xs text-destructive">
                  Some items are no longer available at the requested quantity.
                  Adjust or remove them to continue.
                </p>
              )}

              <Button
                type="button"
                onClick={onCheckoutClick}
                disabled={checkingStock || hasBlockingIssue}
                className="w-full text-white"
                size="lg"
              >
                {checkingStock ? "Checking availability…" : "Checkout"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}