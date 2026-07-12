"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { createOrderAction } from "@/lib/actions/orders";
import type { OrderItemRequest } from "@/types/order";

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, updateQuantity, removeItem, total, clear } = useCart();
  const [state, formAction] = useActionState(createOrderAction, null);

  // On success, clear the cart and hand off to /my/orders/[id], which
  // already renders PayHereCheckout for PENDING orders -- the decided
  // redirect target, no new /checkout/[orderId] page needed.
  useEffect(() => {
    if (state?.success && state.orderId) {
      clear();
      router.push(`/my/orders/${state.orderId}`);
    }
  }, [state, clear, router]);

  const onCheckoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== "authenticated") {
      e.preventDefault();
      // /login's callbackUrl guard only honors /my, /admin, /employee
      // prefixes, so we route through /my/checkout-redirect, which bounces
      // straight back to /cart. Cart lives in localStorage, so it survives
      // this round trip untouched.
      router.push("/login?callbackUrl=/my/checkout-redirect");
    }
  };

  const orderItems: OrderItemRequest[] = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    size: i.size ?? undefined,
  }));

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
        {items.map((item) => (
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
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-semibold">LKR {total.toLocaleString()}</span>
      </div>

      {state && !state.success && (
        <p className="mt-3 text-sm text-destructive">{state.message}</p>
      )}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="itemsJson" value={JSON.stringify(orderItems)} />
        <Button type="submit" onClick={onCheckoutClick} className="w-full text-white" size="lg">
          Checkout
        </Button>
      </form>
    </div>
  );
}