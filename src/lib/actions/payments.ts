"use server";

import { apiRequestWithRefresh } from "@/lib/api/server";

export type PaymentInitiateData = {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  hash: string;
  itemsDescription: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
};

export type PaymentInitiateResult =
  | { success: true; data: PaymentInitiateData }
  | { success: false; message: string };

export async function initiatePaymentAction(orderId: string): Promise<PaymentInitiateResult> {
  const result = await apiRequestWithRefresh<PaymentInitiateData>(`/api/payments/initiate`, {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, data: result.data };
}