"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { PayHereCheckout } from "@/components/payments/payhere-checkout";
import type { PaymentMethod } from "@/types/order";

const EXPIRY_MINUTES = 30; // must match backend StaleOrderExpiryJob.EXPIRY_MINUTES

function useCountdown(createdAt: string) {
  const [msLeft, setMsLeft] = useState<number | null>(null); // null until mounted client-side

  useEffect(() => {
    const expiresAt = new Date(createdAt).getTime() + EXPIRY_MINUTES * 60 * 1000;

    const tick = () => setMsLeft(expiresAt - Date.now());
    tick(); // set immediately on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return msLeft;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PaymentContinueCard({
  orderId,
  paymentMethod,
  isRentalDeposit,
  createdAt,
}: {
  orderId: string;
  paymentMethod: PaymentMethod;
  isRentalDeposit: boolean;
  createdAt: string;
}) {
  const [showPayment, setShowPayment] = useState(false);
  const msLeft = useCountdown(createdAt);
  const expired = msLeft !== null && msLeft <= 0;

  if (showPayment && !expired) {
    return <PayHereCheckout orderId={orderId} paymentMethod={paymentMethod} isRentalDeposit={isRentalDeposit} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        Payment pending
      </div>

      {expired ? (
        <p className="text-[13px] text-status-cancelled">
          This order has expired and its stock has been released. Please place a new order.
        </p>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-muted-foreground">
            Complete payment to confirm this order before it expires.
          </p>
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Expires in{" "}
            <span className="font-medium text-foreground">
              {msLeft === null ? "--:--" : formatCountdown(msLeft)}
            </span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue to payment
          </button>
        </>
      )}
    </div>
  );
}