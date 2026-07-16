"use server";

import { revalidatePath } from "next/cache";
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

export type ConfirmCashPaymentData = {
  status: string;
};

export type ConfirmCashPaymentState =
  | { success: true; data: ConfirmCashPaymentData }
  | { success: false; message: string }
  | null;

/**
 * ADMIN/EMPLOYEE -- POST /api/payments/{orderId}/confirm-cash
 * Confirms a CASH-method order's payment, flipping Payment.status -> COMPLETED
 * and Order.status PENDING -> CONFIRMED (see PaymentServiceImpl.confirmCashPayment).
 * Only valid while the order is still PENDING and its paymentMethod is CASH --
 * the backend rejects otherwise with an IllegalStateException (400).
 */
export async function confirmCashPaymentAction(
  orderId: string,
  _prevState: ConfirmCashPaymentState,
  _formData: FormData,
): Promise<ConfirmCashPaymentState> {
  const result = await apiRequestWithRefresh<ConfirmCashPaymentData>(
    `/api/payments/${orderId}/confirm-cash`,
    { method: "POST" },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true, data: result.data };
}

export type PaymentStatusData = {
  status: string; // "PENDING" | "COMPLETED" | "FAILED"
};

export type PaymentStatusResult =
  | { success: true; data: PaymentStatusData }
  | { success: false; message: string };

export async function getPaymentStatusAction(orderId: string): Promise<PaymentStatusResult> {
  const result = await apiRequestWithRefresh<PaymentStatusData>(
    `/api/payments/status/${orderId}`,
    { method: "GET" },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, data: result.data };
}