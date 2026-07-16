"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

export function TermsModal({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  function handleScroll() {
    const el = contentRef.current;
    if (!el) return;
    // 8px tolerance so it triggers even if the last pixel or two never
    // quite reaches the exact bottom due to rounding.
    const reachedBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (reachedBottom) setScrolledToBottom(true);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Terms and Conditions</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-foreground"
        >
          <section>
            <h3 className="mb-1 font-semibold">1. Orders</h3>
            <p>
              By placing an order through Blanche Bridal, you confirm that the details you provide —
              including sizing, delivery address, and contact information — are accurate and complete. We
              reserve the right to contact you to confirm order details before processing, and to decline
              or cancel orders that cannot be fulfilled, including where an item becomes unavailable after
              your order is placed. In such cases, any payment already made will be refunded in full.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">2. Payment</h3>
            <p>
              All online payments are processed securely through our payment partner, PayHere. We do not
              store your card details on our servers. Orders are only confirmed once payment has been
              successfully received and verified.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">3. Delivery &amp; Pickup</h3>
            <p>
              Orders may be delivered to an address you provide or collected in person at our boutique.
              Delivery times are estimates and may vary depending on your location. Please ensure someone
              is available to receive the order, or to collect it at the agreed pickup time — additional
              charges may apply for redelivery or extended storage if this is not possible.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">4. Rentals</h3>
            <p>
              Rented items remain the property of Blanche Bridal at all times. Renters are responsible for
              returning items in the same condition they were received, by the agreed return date. Damage
              beyond normal wear, loss, or late return may result in additional charges.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">5. Cancellations &amp; Refunds</h3>
            <p>
              Purchase orders may be cancelled free of charge before the order enters Processing. Rental
              bookings cancelled well in advance are generally eligible for a full or partial deposit
              refund; late cancellations may forfeit some or all of the deposit. Approved refunds are
              processed back to the original payment method.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">6. Privacy</h3>
            <p>
              Information you provide — contact details, delivery address, and measurements — is used
              solely to process your order and communicate with you. We do not sell or share your
              information beyond what's necessary to fulfill your order.
            </p>
          </section>

          <p className="pb-2 text-xs text-muted-foreground">
            For the complete Terms and Conditions, visit the full{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Terms and Conditions page
            </a>
            .
          </p>
        </div>

        <div className="border-t border-border px-5 py-4">
          {!scrolledToBottom && (
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Scroll to the bottom to continue
            </p>
          )}
          <button
            type="button"
            disabled={!scrolledToBottom}
            onClick={onAccept}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            I have read and agree
          </button>
        </div>
      </div>
    </div>
  );
}