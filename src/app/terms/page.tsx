export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Terms and Conditions</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: [date]</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Orders</h2>
          <p>
            By placing an order through Blanche Bridal, you confirm that the details provided (including
            sizing, delivery address, and contact information) are accurate. We reserve the right to
            contact you to confirm order details before processing, and to decline or cancel orders that
            cannot be fulfilled.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Payment</h2>
          <p>
            All payments are processed securely through our payment partner, PayHere. We do not store your
            card details on our servers. Orders are only confirmed once payment has been successfully
            received.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Rentals</h2>
          <p>
            Rented items remain the property of Blanche Bridal at all times. Renters are responsible for
            returning items in the condition they were received, by the agreed return date. Damage, loss,
            or late return may result in additional charges as outlined at the time of booking.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Custom Design Consultations</h2>
          <p>
            Custom design consultations are booked subject to availability. Deposits or fees paid to
            secure a consultation slot may be non-refundable in the event of a no-show or late
            cancellation, as communicated at the time of booking.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Cancellations &amp; Refunds</h2>
          <p>
            Cancellation requests should be made as early as possible. Eligibility for a refund depends on
            the order type (purchase, rental, or custom design) and how far in advance the request is
            made. Approved refunds will be processed back to the original payment method within a
            reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Changes to These Terms</h2>
          <p>
            We may update these Terms and Conditions from time to time. Continued use of our services
            after changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please reach out to us at{" "}
            <span className="text-muted-foreground">[contact email placeholder]</span> or{" "}
            <span className="text-muted-foreground">[contact phone placeholder]</span>.
          </p>
        </section>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        This content is placeholder text and has not been legally reviewed. Replace with reviewed terms
        before going live.
      </p>
    </div>
  );
}