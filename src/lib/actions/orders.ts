"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Order, PaymentMethod, OrderStatus } from "@/types/order";
import type { OrderItemRequest } from "@/types/order";
import { getOrderById } from "../api/orders";
import { finishOrderCreate } from "./action-helpers";

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

export type CreateOrderState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
} | null;

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

export async function createOrderAction(
  _prevState: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const itemsJson = formData.get("itemsJson") as string;
  let items: OrderItemRequest[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { success: false, message: "Could not read order items — please try again." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "Add at least one item to the order." };
  }

  const customerId = formData.get("customerId") as string;
  const fulfillmentMethod = formData.get("fulfillmentMethod") as string;
  const deliveryAddress = formData.get("deliveryAddress") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const orderMode = formData.get("orderMode") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const notes = formData.get("notes") as string;
  const discountType = formData.get("discountType") as string;
  const discountValue = formData.get("discountValue") as string;
  const discountReason = formData.get("discountReason") as string;

  const result = await apiRequestWithRefresh<Order>(`/api/orders`, {
    method: "POST",
    body: JSON.stringify({
      items,
      notes: notes || undefined,
      fulfillmentMethod: fulfillmentMethod || undefined,
      deliveryAddress: deliveryAddress || undefined,
      customerPhone: customerPhone || undefined,
      orderMode: orderMode || undefined,
      paymentMethod: paymentMethod || undefined,
      customerId: customerId || undefined,
      // Staff-only discount fields — omitted entirely (not just empty) when
      // no discount type is selected, so the backend's null-check behaves
      // as documented rather than receiving an empty-string discountType.
      discountType: discountType || undefined,
      discountValue: discountValue ? Number(discountValue) : undefined,
      discountReason: discountReason || undefined,
    }),
  });

  return finishOrderCreate(result, "Order created.");
}

// ADMIN -- PUT /api/orders/{id}/payment-method
// Lets admin switch a still-PENDING order's payment method -- e.g. a
// custom-order first/second payment created as PAYHERE where the customer
// actually wants to pay cash in person. Backend rejects (see
// OrderServiceImpl.updatePaymentMethod) if the order is no longer PENDING,
// or if a COMPLETED Payment row already exists for it.
//
// customDesignRequestId is required (not optional like the confirm-cash/
// confirm-bank-transfer actions in lib/actions/payments.ts) because this
// action only has a caller today -- PaymentMethodSwitch on
// /admin/custom-orders/[id] -- so there's no plain-order revalidation path
// to fall back to yet. Widen to optional (mirroring payments.ts's pattern)
// if a non-custom-order caller shows up later.
export type UpdatePaymentMethodState =
  | { success: true }
  | { success: false; message: string }
  | null;

export async function updatePaymentMethodAction(
  orderId: string,
  customDesignRequestId: string,
  method: PaymentMethod,
  _prevState: UpdatePaymentMethodState,
  _formData: FormData,
): Promise<UpdatePaymentMethodState> {
  const result = await apiRequestWithRefresh<Order>(`/api/orders/${orderId}/payment-method`, {
    method: "PUT",
    body: JSON.stringify({ paymentMethod: method }),
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return { success: true };
}
export type OrderCustomDesignIdResult =
  | { success: true; customDesignRequestId: string | null }
  | { success: false };

/**
 * Thin client-callable wrapper around getOrderById, used only by
 * /checkout/success to decide whether to redirect to the custom-design
 * page or the generic order receipt once payment completes. Doesn't
 * return the full Order — just the one field the success page needs.
 */
export async function getOrderCustomDesignIdAction(orderId: string): Promise<OrderCustomDesignIdResult> {
  const result = await getOrderById(orderId);
  if (!result.success) {
    return { success: false };
  }
  return { success: true, customDesignRequestId: result.data.customDesignRequestId };
}

export type OrderStatusResult =
  | { success: true; status: OrderStatus }
  | { success: false };

/**
 * Thin client-callable wrapper around getOrderById, used by LiveOrderStatus
 * to poll just the status field rather than refetching+re-rendering the
 * whole order detail page. Mirrors getOrderCustomDesignIdAction's pattern.
 */
export async function getOrderStatusAction(orderId: string): Promise<OrderStatusResult> {
  const result = await getOrderById(orderId);
  if (!result.success) {
    return { success: false };
  }
  return { success: true, status: result.data.status };
}