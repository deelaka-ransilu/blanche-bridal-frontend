"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { createOrderAction } from "@/lib/actions/orders";
import { checkCartStockAction, type CartStockInfo } from "@/lib/actions/cart";
import type { OrderItemRequest } from "@/types/order";

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, updateQuantity, removeItem, total, clear } = useCart();
  const [state, formAction] = useActionState(createOrderAction, null);

  const [stockInfo, setStockInfo] = useState<Record<string, CartStockInfo>>({});
  const [checkingStock, setCheckingStock] = useState(true);

  // Revalidate stock every time the cart page is visited/items change —
  // catches the case where an item sat in the cart for a while and stock
  // moved underneath it. This is a UX improvement on top of the backend's
  // existing hard guarantee (OrderServiceImpl.createOrder's pessimistic
  // lock) — that guarantee already prevents overselling; this just surfaces
  // the problem to the customer earlier, before they hit Checkout.
  useEffect(() => {
    if (items.length === 0) {
      setCheckingStock(false);
      return;
    }
    setCheckingStock(true);
    checkCartStockAction(items.map((i) => i.productId))
      .then(setStockInfo)
      .finally(() => setCheckingStock(false));
  }, [items]);

  useEffect(() => {
    if (state?.success && state.orderId) {
      clear();
      router.push(`/my/orders/${state.orderId}`);
    }
  }, [state, clear, router]);

  const onCheckoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== "authenticated") {
      e.preventDefault();
      router.push("/login?callbackUrl=/my/checkout-redirect");
    }
  };

  const orderItems: OrderItemRequest[] = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    size: i.size ?? undefined,
  }));

  // Blocks checkout if any line is unavailable or over the current stock.
  const hasBlockingIssue = items.some((item) => {
    const info = stockInfo[item.productId];
    if (!info) return false; // still loading / unknown — don't block yet
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

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-medium">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground">
            Browse our products to add something to your cart.
          </p>
        </div>
        <Link href="/products">
          <Button className="text-white">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <h1 className="mb-6 text-xl font-semibold">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => {
          const issue = lineIssue(item);
          return (
            <div
              key={`${item.productId}-${item.size ?? "default"}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {item.size && (
                  <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  LKR {item.unitPrice.toLocaleString()}
                </p>
                {issue && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {issue}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.quantity + 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.productId, item.size)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-semibold">LKR {total.toLocaleString()}</span>
      </div>

      {hasBlockingIssue && (
        <p className="mt-3 text-sm text-destructive">
          Some items in your cart are no longer available at the requested quantity. Adjust or remove them to continue.
        </p>
      )}

      {state && !state.success && (
        <p className="mt-3 text-sm text-destructive">{state.message}</p>
      )}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="itemsJson" value={JSON.stringify(orderItems)} />
        <Button
          type="submit"
          onClick={onCheckoutClick}
          disabled={checkingStock || hasBlockingIssue}
          className="w-full text-white"
          size="lg"
        >
          {checkingStock ? "Checking availability…" : "Checkout"}
        </Button>
      </form>
    </div>
  );
}