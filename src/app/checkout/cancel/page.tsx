"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, Loader2 } from "lucide-react";
import { PayHereCheckout } from "@/components/payments/payhere-checkout";

export default function CheckoutCancelPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [retrying, setRetrying] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">Payment cancelled</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          No worries — your order is still saved. You can pick up where you left off.
        </p>

        {orderId ? (
          retrying ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <PayHereCheckout orderId={orderId} paymentMethod="PAYHERE" isRentalDeposit={false} />
            </div>
          ) : (
            <button
              onClick={() => setRetrying(true)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Retry payment
            </button>
          )
        ) : (
          <p className="mb-4 text-xs text-muted-foreground">
            We couldn&apos;t find your order to retry — check My Orders instead.
          </p>
        )}

        <Link href="/my/orders" className="mt-4 block text-xs text-muted-foreground hover:underline">
          Go to my orders
        </Link>
      </div>
    </div>
  );
}