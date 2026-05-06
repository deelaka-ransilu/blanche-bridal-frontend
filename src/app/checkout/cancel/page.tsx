"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/api/orders";

// ── Inner component — uses useSearchParams so must be inside Suspense ─────────
function CancelContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // PayHere passes order_id back in the cancel redirect URL
  const orderId = searchParams.get("order_id");
  const token = session?.user?.backendToken;

  // Use a ref so the cancel call fires exactly once even in React strict mode
  const hasCancelled = useRef(false);

  useEffect(() => {
    if (!orderId || !token || hasCancelled.current) return;
    hasCancelled.current = true;

    cancelOrder(orderId, token).catch((err) => {
      // Non-fatal — the OrderScheduler will clean up stale PENDING orders
      // automatically after 30 minutes if this call fails for any reason.
      console.warn("[Cancel page] Could not cancel order on backend:", err);
    });
  }, [orderId, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Message */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Payment Cancelled
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your payment was not completed. Your cart is still saved — you can
            try again whenever you&apos;re ready.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link href="/checkout">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              Try Again
            </Button>
          </Link>
          <Link href="/catalog">
            <Button variant="ghost" className="w-full text-gray-600">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Outer page — wraps in Suspense for useSearchParams ────────────────────────
export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}