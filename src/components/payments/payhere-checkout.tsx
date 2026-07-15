"use client";

import { useEffect, useRef, useState } from "react";
import { initiatePaymentAction, type PaymentInitiateData } from "@/lib/actions/payments";
import type { PaymentMethod } from "@/types/order";

const PAYHERE_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true"
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";

export function PayHereCheckout({
  orderId,
  paymentMethod,
  isRentalDeposit,
}: {
  orderId: string;
  paymentMethod: PaymentMethod;
  isRentalDeposit: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<PaymentInitiateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(paymentMethod === "PAYHERE");

  useEffect(() => {
    if (paymentMethod !== "PAYHERE") return;

    let cancelled = false;
    initiatePaymentAction(orderId).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }
      setData(result.data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [orderId, paymentMethod]);

  // Auto-submit once PayHere fields are ready
  useEffect(() => {
    if (data && formRef.current) {
      formRef.current.submit();
    }
  }, [data]);

  if (paymentMethod === "CASH") {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">
          {isRentalDeposit ? "Rental deposit" : "Order"} pending — pay in person
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This {isRentalDeposit ? "booking" : "order"} is set up for cash payment. Our
          team will contact you to confirm payment and finalize the details.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Preparing secure payment…</p>
      </div>
    );
  }

  // Hidden auto-submitting form -- PayHere requires a real browser POST with
  // these exact field names, not a fetch/XHR call.
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">Redirecting to secure payment…</p>
      <form ref={formRef} method="POST" action={PAYHERE_CHECKOUT_URL} className="hidden">
        <input type="hidden" name="merchant_id" value={data.merchantId} />
        <input type="hidden" name="return_url" value={data.returnUrl} />
        <input type="hidden" name="cancel_url" value={data.cancelUrl} />
        <input type="hidden" name="notify_url" value={data.notifyUrl} />
        <input type="hidden" name="order_id" value={data.orderId} />
        <input type="hidden" name="items" value={data.itemsDescription} />
        <input type="hidden" name="currency" value={data.currency} />
        <input type="hidden" name="amount" value={data.amount} />
        <input type="hidden" name="first_name" value={data.customerFirstName} />
        <input type="hidden" name="last_name" value={data.customerLastName} />
        <input type="hidden" name="email" value={data.customerEmail} />
        <input type="hidden" name="phone" value={data.customerPhone} />
        <input type="hidden" name="address" value={data.customerAddress} />
        <input type="hidden" name="city" value={data.customerCity} />
        <input type="hidden" name="country" value="Sri Lanka" />
        <input type="hidden" name="hash" value={data.hash} />
      </form>
    </div>
  );
}