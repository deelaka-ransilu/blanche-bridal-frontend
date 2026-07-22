"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Order } from "@/types/order";

export type ConfirmSecondPaymentState =
  | { success: true; data: Order }
  | { success: false; message: string }
  | null;

/**
 * ADMIN -- POST /api/custom-design-requests/{id}/confirm-second-payment
 * Creates the second (remaining 50%) payment Order for a custom order at
 * pickup, once production has reached READY_FOR_PICKUP (see
 * CustomOrderServiceImpl.confirmSecondPayment). Mirrors
 * confirmHandoverAction in rentals.ts.
 *
 * Bound with .bind(null, customDesignRequestId) at the call site, so the
 * component only needs to supply paymentMethod via the form.
 */
export async function confirmSecondPaymentAction(
  customDesignRequestId: string,
  _prevState: ConfirmSecondPaymentState,
  formData: FormData,
): Promise<ConfirmSecondPaymentState> {
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!paymentMethod) {
    return { success: false, message: "Please choose a payment method." };
  }

  const result = await apiRequestWithRefresh<Order>(
    `/api/custom-design-requests/${customDesignRequestId}/confirm-second-payment`,
    {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);

  return { success: true, data: result.data };
}