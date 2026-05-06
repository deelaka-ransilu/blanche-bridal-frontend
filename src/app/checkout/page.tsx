"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { createOrder, initiatePayment } from "@/lib/api/orders";
import { submitPayHereForm } from "@/lib/payhere";
import { Button } from "@/components/ui/button";

// Key used to detect that the user navigated away to PayHere
const PAYHERE_REDIRECT_KEY = "payhere_redirected";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const clearCart = useCartStore((s) => s.clearCart);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: if we're returning from PayHere (user pressed back),
  // sessionStorage will have the flag we set before redirecting.
  // In that case clear the cart (order was already created) and
  // redirect to the cancel page so the order gets cancelled server-side.
  useEffect(() => {
    const wasRedirected = sessionStorage.getItem(PAYHERE_REDIRECT_KEY);
    if (wasRedirected) {
      sessionStorage.removeItem(PAYHERE_REDIRECT_KEY);
      const orderId = wasRedirected; // we store the orderId as the value
      clearCart();
      // Redirect to cancel page — it will call POST /api/orders/{id}/cancel
      router.replace(`/checkout/cancel?order_id=${orderId}`);
    }
  }, [clearCart, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/catalog");
    }
  }, [items.length, router]);

  async function handlePlaceOrder() {
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    setLoading(true);

    try {
      const orderRes = await createOrder(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.selectedSize,
        })),
        notes.trim() || undefined,
        token,
      );

      if (!orderRes.success || !orderRes.data) {
        toast.error(orderRes.error?.message ?? "Failed to create order.");
        setLoading(false);
        return;
      }

      const payRes = await initiatePayment(orderRes.data.id, token);

      if (!payRes.success || !payRes.data) {
        toast.error(payRes.error?.message ?? "Failed to initiate payment.");
        setLoading(false);
        return;
      }

      // Store the orderId in sessionStorage BEFORE navigating away.
      // If the user presses back from PayHere, the mount effect above
      // will detect this and redirect to /checkout/cancel.
      sessionStorage.setItem(PAYHERE_REDIRECT_KEY, orderRes.data.id);

      // Clear the cart now — the order has been created on the backend.
      // Whether payment succeeds or fails, the cart items have been
      // committed to an order and should not be re-ordered accidentally.
      clearCart();

      submitPayHereForm(payRes.data);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — order summary */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border divide-y">
              {items.map((item) => {
                const price = item.rentalPrice ?? item.purchasePrice ?? 0;
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={`${item.productId}-${item.selectedSize ?? "no-size"}`}
                    className="flex gap-4 p-4"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      {item.selectedSize && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 mt-0.5 inline-block">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        LKR {price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 shrink-0 pt-0.5">
                      LKR {subtotal.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border p-4">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Order notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Any special requests or notes for your order..."
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {notes.length}/500
              </p>
            </div>
          </div>

          {/* Right — price summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-5 sticky top-24 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-2">
                {items.map((item) => {
                  const price = item.rentalPrice ?? item.purchasePrice ?? 0;
                  return (
                    <div
                      key={`${item.productId}-${item.selectedSize ?? "no-size"}`}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span className="truncate mr-2">
                        {item.productName}{" "}
                        {item.selectedSize && `(${item.selectedSize})`} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="shrink-0">
                        LKR {(price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-amber-700">
                  LKR {totalAmount().toLocaleString()}
                </span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order & Pay"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to PayHere to complete payment securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}