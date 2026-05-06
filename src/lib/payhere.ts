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
 */
export function submitPayHereForm(data: PaymentInitiateResponse): void {
  // Clean up any leftover form from a previous attempt
  document.getElementById("payhere-form")?.remove();

  const form = document.createElement("form");
  form.id = "payhere-form";
  form.method = "POST";
  form.action = PAYHERE_URL;

  const fields: Record<string, string> = {
    merchant_id:  data.merchantId,
    return_url:   data.returnUrl,
    cancel_url:   data.cancelUrl,
    notify_url:   data.notifyUrl,
    order_id:     data.orderId,
    items:        data.itemsDescription,
    currency:     data.currency,
    amount:       data.amount,
    first_name:   data.customerFirstName,
    last_name:    data.customerLastName,
    email:        data.customerEmail,
    phone:        data.customerPhone,
    address:      data.customerAddress,
    city:         data.customerCity,
    country:      "Sri Lanka",
    hash:         data.hash,
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