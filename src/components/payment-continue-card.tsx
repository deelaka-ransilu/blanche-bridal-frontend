"use client";

import { useState } from "react";
import { ShieldCheck, HandCoins } from "lucide-react";
import { PayHereCheckout } from "@/components/payments/payhere-checkout";
import type { PaymentMethod } from "@/types/order";

export function PaymentContinueCard({
  orderId,
  paymentMethod,
  isRentalDeposit,
}: {
  orderId: string;
  paymentMethod: PaymentMethod;
  isRentalDeposit: boolean;
}) {
  const [showPayment, setShowPayment] = useState(false);

  // Cash rental deposits: paid in person at pickup, no PayHere step.
  if (isRentalDeposit && paymentMethod !== "PAYHERE") {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
          <HandCoins className="h-4 w-4 text-muted-foreground" />
          Booking submitted
        </div>
        <p className="text-[13px] text-muted-foreground">
          We&apos;ll review your rental request and confirm availability, then
          reach out to arrange pickup. Payment is cash, due when you collect
          the item — no payment is needed right now.
        </p>
      </div>
    );
  }

  if (showPayment) {
    return <PayHereCheckout orderId={orderId} paymentMethod={paymentMethod} isRentalDeposit={isRentalDeposit} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        Payment pending
      </div>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Complete payment to confirm this {isRentalDeposit ? "booking" : "order"}.
      </p>
      <button
        onClick={() => setShowPayment(true)}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Continue to payment
      </button>
    </div>
  );
}