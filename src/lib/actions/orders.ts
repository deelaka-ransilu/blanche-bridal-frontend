"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Order } from "@/types/order";

// OrderController's PUT /status and POST /cancel both return
// { success, data } via the standard Map.of(...) wrapper (see
// OrderController.java / OrderServiceImpl), so apiRequestWithRefresh's
// ApiResponse<T> assumption is correct here -- no raw-record workaround
// needed, unlike lib/actions/production.ts.
//
// updateOrderStatusAction below is bound directly to <form action={...}>,
// which requires (formData: FormData) => void | Promise<void> per React's
// types. Returns void; success/failure is only reflected via
// revalidatePath's refetch, with no inline error message on failure yet --
// same known gap as lib/actions/production.ts (staff-facing, lower stakes,
// left as a fast-follow rather than converted in this pass).

export async function updateOrderStatusAction(orderId: string, formData: FormData): Promise<void> {
  const status = formData.get("status") as string;
  const result = await apiRequestWithRefresh<Order>(`/api/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  if (!result.success) {
    console.error(`[updateOrderStatusAction] failed for order ${orderId}: ${result.message}`);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// cancelOrderAction uses useActionState (see components/cancel-order-button.tsx)
// rather than the void-return convention above -- a cancel silently "working"
// when it actually didn't (see BACKEND_HANDOVER_V2.md's note on cancelOrder()
// no-op-on-non-PENDING behavior, Backend Issue #3) is a real trust problem
// for a customer-facing action, not just a missing nicety. Closes Issue #15
// for this one mutation; other void-return actions (updateOrderStatusAction
// above, production.ts's approve/reject/propose) are lower-stakes/staff-facing
// and left as void for now -- not a blanket conversion in this pass.

export type CancelOrderState = {
  success: boolean;
  message?: string;
} | null;

export async function cancelOrderAction(
  orderId: string,
  _prevState: CancelOrderState,
  _formData: FormData,
): Promise<CancelOrderState> {
  const result = await apiRequestWithRefresh<undefined>(`/api/orders/${orderId}/cancel`, {
    method: "POST",
  });

  revalidatePath(`/my/orders/${orderId}`);
  revalidatePath("/my/orders");

  if (!result.success) {
    return { success: false, message: result.message };
  }

  // NOTE: backend's cancelOrder() currently returns {success:true} even when
  // it silently no-ops on a non-PENDING order (Backend Issue #3) -- so a
  // "success" here isn't yet a hard guarantee the order actually changed
  // state. Frontend can't distinguish this until that backend bug is fixed;
  // flagging here so a future session doesn't assume this return means the
  // cancellation definitely took effect.
  return { success: true, message: "Order cancelled." };
}