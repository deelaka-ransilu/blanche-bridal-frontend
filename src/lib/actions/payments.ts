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
 *
 * customDesignRequestId is optional: regular (non-custom) purchase/rental
 * orders confirmed from /admin/orders/[id] don't have one, and should keep
 * revalidating the plain orders paths as before. Custom-order callers on
 * /admin/custom-orders/[id] pass it so that page revalidates instead --
 * mirrors the same optional-param shape used in production.ts.
 */
async function confirmPayment(
  endpoint: "confirm-cash" | "confirm-bank-transfer",
  orderId: string,
  customDesignRequestId: string | undefined,
): Promise<ConfirmCashPaymentState> {
  const result = await apiRequestWithRefresh<ConfirmCashPaymentData>(
    `/api/payments/${orderId}/${endpoint}`,
    { method: "POST" },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  if (customDesignRequestId) {
    revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  } else {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
  }

  return { success: true, data: result.data };
}

export async function confirmCashPaymentAction(
  orderId: string,
  customDesignRequestId: string | undefined,
  _prevState: ConfirmCashPaymentState,
  _formData: FormData,
): Promise<ConfirmCashPaymentState> {
  return confirmPayment("confirm-cash", orderId, customDesignRequestId);
}

/**
 * ADMIN -- POST /api/payments/{orderId}/confirm-bank-transfer
 * Confirms a BANK_TRANSFER-method order's payment, flipping Payment.status ->
 * COMPLETED and Order.status -> CONFIRMED (see
 * PaymentServiceImpl.confirmBankTransferPayment). Backend additionally guards
 * that Payment.proofImageUrl is set before allowing confirmation.
 *
 * Bank-transfer confirmation only exists for custom orders in practice today
 * (that's the only flow that produces a proofImageUrl right now), but the
 * param is still optional/same shape as confirmCashPaymentAction above for
 * consistency and in case a non-custom bank-transfer path gets added later.
 */
export async function confirmBankTransferAction(
  orderId: string,
  customDesignRequestId: string | undefined,
  _prevState: ConfirmCashPaymentState,
  _formData: FormData,
): Promise<ConfirmCashPaymentState> {
  return confirmPayment("confirm-bank-transfer", orderId, customDesignRequestId);
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