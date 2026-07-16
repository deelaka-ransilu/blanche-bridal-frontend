"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getPaymentStatusAction } from "@/lib/actions/payments";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

type PollState = "polling" | "completed" | "timeout" | "failed" | "no-order";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const orderId = params.get("orderId");

  const [pollState, setPollState] = useState<PollState>(orderId ? "polling" : "no-order");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      const result = await getPaymentStatusAction(orderId!);
      if (cancelled) return;

      if (result.success && result.data.status === "COMPLETED") {
        setPollState("completed");
        clear(); // cart only clears once payment is actually confirmed
        return;
      }

      if (result.success && result.data.status === "FAILED") {
        setPollState("failed");
        return;
      }

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setPollState("timeout");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {pollState === "polling" && (
          <>
            <Loader2 className="mx-auto mb-5 h-10 w-10 animate-spin text-primary" />
            <h1 className="mb-2 text-xl font-semibold text-foreground">Confirming your payment</h1>
            <p className="text-sm text-muted-foreground">This usually takes a few seconds…</p>
          </>
        )}

        {pollState === "completed" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">Payment successful</h1>
            <p className="mb-8 text-sm text-muted-foreground">
              Your order is confirmed. A receipt has been generated.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/my/orders/${orderId}`}
                className="rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                View order & receipt
              </Link>
              <Link href="/my/orders" className="text-xs text-muted-foreground hover:underline">
                Go to my orders
              </Link>
            </div>
          </>
        )}

        {pollState === "timeout" && (
          <>
            <Loader2 className="mx-auto mb-5 h-10 w-10 text-muted-foreground" />
            <h1 className="mb-2 text-xl font-semibold text-foreground">Still processing</h1>
            <p className="mb-8 text-sm text-muted-foreground">
              Your payment is taking longer than usual to confirm. Check My Orders shortly —
              it&apos;ll update automatically once confirmed.
            </p>
            <Link
              href="/my/orders"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Go to my orders
            </Link>
          </>
        )}

        {(pollState === "failed" || pollState === "no-order") && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">Payment didn&apos;t go through</h1>
            <p className="mb-8 text-sm text-muted-foreground">
              {pollState === "no-order"
                ? "We couldn't find your order. Check My Orders to see its status."
                : "Something went wrong confirming your payment."}
            </p>
            <Link
              href="/my/orders"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Go to my orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
}