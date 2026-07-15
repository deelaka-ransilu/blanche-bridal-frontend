"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Refund } from "@/types/refund";

// RefundController wraps its response as { success: true, data: RefundResponse }
// via Map.of(...) -- same standard envelope as OrderController's status/cancel
// endpoints, so apiRequestWithRefresh's ApiResponse<T> assumption holds here.
//
// useActionState (not void-return) chosen deliberately: refund failures are
// frequent/expected and meaningfully different (400 payment-not-completed,
// 409 already-refunded, 403 non-admin) -- same reasoning as cancelOrderAction.

export type RefundOrderState = {
  success: boolean;
  message?: string;
  data?: Refund;
} | null;

export async function refundOrderAction(
  orderId: string,
  _prevState: RefundOrderState,
  formData: FormData,
): Promise<RefundOrderState> {
  const reason = (formData.get("reason") as string) || undefined;

  const result = await apiRequestWithRefresh<Refund>(`/api/orders/${orderId}/refund`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: "Refund issued.", data: result.data };
}