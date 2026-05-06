import { PaymentInitiateResponse } from "@/types";

// Sandbox: https://sandbox.payhere.lk/pay/checkout
// Live:    https://www.payhere.lk/pay/checkout
const PAYHERE_URL =
  process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true"
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";

/**
 * Builds a hidden HTML form with all PayHere fields and submits it,
 * which navigates the browser to the PayHere payment page.
 *
 * Also registers a one-time `pageshow` listener so that if the user
 * presses the browser back button from PayHere, the page reloads
 * instead of restoring from bfcache (which shows a blank screen).
 */
export function submitPayHereForm(data: PaymentInitiateResponse): void {
  // Register the bfcache fix BEFORE form.submit() navigates away.
  // `pageshow` fires when the page is restored from bfcache (e.persisted = true).
  // We use { once: true } so it self-removes after firing once.
  window.addEventListener(
    "pageshow",
    (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from bfcache — force a clean reload so the
        // checkout page re-renders properly instead of showing blank.
        window.location.reload();
      }
    },
    { once: true },
  );

  // Clean up any leftover form from a previous attempt
  document.getElementById("payhere-form")?.remove();

  const form = document.createElement("form");
  form.id = "payhere-form";
  form.method = "POST";
  form.action = PAYHERE_URL;

  const fields: Record<string, string> = {
    merchant_id: data.merchantId,
    return_url:  data.returnUrl,
    cancel_url:  data.cancelUrl,
    notify_url:  data.notifyUrl,
    order_id:    data.orderId,
    items:       data.itemsDescription,
    currency:    data.currency,
    amount:      data.amount,
    first_name:  data.customerFirstName,
    last_name:   data.customerLastName,
    email:       data.customerEmail,
    phone:       data.customerPhone,
    address:     data.customerAddress,
    city:        data.customerCity,
    country:     "Sri Lanka",
    hash:        data.hash,
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = name;
    input.value = value ?? "";
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}