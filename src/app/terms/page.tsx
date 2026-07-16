export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Terms and Conditions</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: 16 July 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Orders</h2>
          <p>
            By placing an order through Blanche Bridal, you confirm that the details you provide —
            including sizing, delivery address, and contact information — are accurate and complete. We
            reserve the right to contact you to confirm order details before processing, and to decline or
            cancel orders that cannot be fulfilled, including where an item becomes unavailable after
            your order is placed. In such cases, any payment already made will be refunded in full.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Payment</h2>
          <p>
            All online payments are processed securely through our payment partner, PayHere. We do not
            store your card details on our servers — card information is handled entirely by PayHere in
            accordance with their own security standards. Orders are only confirmed once payment has been
            successfully received and verified.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Delivery &amp; Pickup</h2>
          <p>
            Orders may be delivered to an address you provide or collected in person at our boutique,
            depending on the option you select at checkout. Delivery times are estimates and may vary
            depending on your location. Please ensure someone is available to receive the order at the
            address provided, or to collect it at the agreed pickup time — additional charges may apply
            for redelivery or extended storage if this is not possible.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Rentals</h2>
          <p>
            Rented items remain the property of Blanche Bridal at all times. Renters are responsible for
            returning items in the same condition they were received, by the agreed return date. Damage
            beyond normal wear, loss, or late return may result in additional charges, up to and including
            the full replacement value of the item, as outlined at the time of booking.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Custom Design Consultations</h2>
          <p>
            Custom design consultations are booked subject to availability. Deposits or fees paid to
            secure a consultation slot may be non-refundable in the event of a no-show or a cancellation
            made with insufficient notice, as communicated to you at the time of booking. Custom pieces
            are made to your specifications and measurements; please review all details carefully before
            confirming, as changes after production has begun may not be possible or may incur
            additional cost.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Cancellations &amp; Refunds</h2>
          <p>
            Cancellation requests should be made as early as possible. Eligibility for a refund depends on
            the order type (purchase, rental, or custom design) and how far in advance the request is
            made:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Purchases:</span> orders may be cancelled free
              of charge before the order status changes to Processing. Once an order has entered
              production or shipping, cancellation may not be possible.
            </li>
            <li>
              <span className="font-medium text-foreground">Rentals:</span> bookings cancelled well in
              advance of the rental date are generally eligible for a full or partial refund of the
              deposit; late cancellations may forfeit some or all of the deposit.
            </li>
            <li>
              <span className="font-medium text-foreground">Custom design:</span> see Section 5 above.
            </li>
          </ul>
          <p className="mt-2">
            Approved refunds are processed back to the original payment method and may take several
            business days to reflect, depending on your bank or card issuer.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Product Accuracy</h2>
          <p>
            We make every effort to display product colours, fabrics, and details as accurately as
            possible. However, actual colours may vary slightly depending on your device's display
            settings. Measurements provided for each product are approximate; please refer to our size
            guide or contact us directly if you're unsure which size to choose.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">8. Privacy</h2>
          <p>
            Information you provide to us — including contact details, delivery address, and measurements
            — is used solely to process your order, deliver our services, and communicate with you about
            your booking. We do not sell or share your personal information with third parties beyond
            what is necessary to fulfill your order (such as our payment processor, PayHere).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">9. Changes to These Terms</h2>
          <p>
            We may update these Terms and Conditions from time to time to reflect changes in our services
            or for legal and operational reasons. Continued use of our services after changes are posted
            constitutes acceptance of the updated terms. We encourage you to review this page
            periodically.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please reach out to us at{" "}
            <span className="font-medium text-foreground">blanchebridal.noreply@gmail.com</span> or{" "}
            <span className="font-medium text-foreground">071 234 5678</span>.
          </p>
        </section>
      </div>
    </div>
  );
}