import { PaymentInitiateResponse } from "@/types";

/**
 * PayHere sandbox checklist (run through this if payment fails):
 *
 * 1. NEXT_PUBLIC_PAYHERE_SANDBOX=true must be set in .env.local
 * 2. notify_url CANNOT be localhost — PayHere's server can't reach your machine.
 *    Use ngrok: `ngrok http 8080` and set BACKEND_URL to the ngrok URL.
 *    The backend generates notify_url, so update it there, not here.
 * 3. Hash must be MD5( merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
 *    Amount must be formatted to 2 decimal places BEFORE hashing.
 * 4. Sandbox test cards: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
 *    Visa: 4916217501611292 | Exp: any future | CVV: any 3 digits
 * 5. phone field must not be empty — use a fallback.
 */
export function submitPayHereForm(params: PaymentInitiateResponse): void {
  const isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true";
  const PAYHERE_URL = isSandbox
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";

  if (process.env.NODE_ENV === "development") {
    console.group("PayHere submit");
    console.log("Sandbox mode:", isSandbox);
    console.log("URL:", PAYHERE_URL);
    console.log("Params:", params);
    console.groupEnd();
  }

  const fields: Record<string, string> = {
    merchant_id:  params.merchantId,
    return_url:   params.returnUrl,
    cancel_url:   params.cancelUrl,
    notify_url:   params.notifyUrl,
    order_id:     params.orderId,
    items:        params.itemsDescription,
    currency:     params.currency,
    amount:       params.amount,
    hash:         params.hash,
    first_name:   params.customerFirstName,
    last_name:    params.customerLastName,
    email:        params.customerEmail,
    // phone must not be empty — PayHere rejects blank phone in sandbox
    phone:        params.customerPhone ?? "0000000000",
    address:      params.customerAddress ?? "N/A",
    city:         params.customerCity ?? "Colombo",
    country:      "Sri Lanka",
  };

  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYHERE_URL;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  // PayHere requires a real browser form POST — fetch() will not work
  document.body.appendChild(form);
  form.submit();
}