"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const router = useRouter();
  const { data: session } = useSession();

  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalAmount = useCartStore((s) => s.totalAmount);

  function handleCheckout() {
    closeCart();
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-0"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <ShoppingBag className="w-4 h-4" />
            Your cart
            {totalItems() > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                {totalItems()}
              </span>
            )}
          </SheetTitle>
          <button
            onClick={closeCart}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </SheetHeader>

        {/* Body */}
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center flex-1 gap-4 px-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add items from the catalog to get started.
              </p>
            </div>
            <Link href="/catalog" onClick={closeCart}>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Browse Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Item list */}
            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => {
                const price = item.rentalPrice ?? item.purchasePrice ?? 0;
                const subtotal = price * item.quantity;

                return (
                  <li
                    key={`${item.productId}-${item.selectedSize ?? "no-size"}`}
                    className="flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      {item.selectedSize && (
                        <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          Size: {item.selectedSize}
                        </span>
                      )}

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.selectedSize,
                              item.quantity - 1,
                            )
                          }
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.selectedSize,
                              item.quantity + 1,
                            )
                          }
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() =>
                            removeItem(item.productId, item.selectedSize)
                          }
                          className="ml-auto p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-sm font-semibold text-gray-900 shrink-0 pt-0.5">
                      LKR {subtotal.toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Sticky footer */}
            <div className="border-t px-5 py-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-base font-semibold text-gray-900">
                  LKR {totalAmount().toLocaleString()}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
