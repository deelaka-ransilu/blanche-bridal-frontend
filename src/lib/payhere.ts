import { PaymentInitiateResponse } from "@/types";
import { log } from "console";

export function submitPayHereForm(params: PaymentInitiateResponse): void {
  const isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true";
  const PAYHERE_URL = isSandbox
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";
  console.log("Submitting PayHere form with params:", params);
  console.log("PayHere URL:", PAYHERE_URL);
  console.log("Is Sandbox:", isSandbox);
  const fields: Record<string, string> = {
    merchant_id: params.merchantId,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    order_id: params.orderId,
    items: params.itemsDescription,
    currency: params.currency,
    amount: params.amount,
    hash: params.hash,
    first_name: params.customerFirstName,
    last_name: params.customerLastName,
    email: params.customerEmail,
    phone: "",
    address: "N/A",
    city: "Colombo",
    country: "Sri Lanka",
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

  // Must be a real browser form submit — fetch() does not work with PayHere
  document.body.appendChild(form);
  form.submit();
}
