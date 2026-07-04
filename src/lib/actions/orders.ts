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
// RETURN TYPE: bound directly to <form action={...}>, which requires
// (formData: FormData) => void | Promise<void> per React's types. So these
// return void; success/failure is only reflected via revalidatePath's
// refetch, with no inline error message on failure yet -- same known gap
// as lib/actions/production.ts (fast-follow: useActionState client wrapper).

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

export async function cancelOrderAction(orderId: string): Promise<void> {
  const result = await apiRequestWithRefresh<undefined>(`/api/orders/${orderId}/cancel`, {
    method: "POST",
  });

  if (!result.success) {
    console.error(`[cancelOrderAction] failed for order ${orderId}: ${result.message}`);
  }

  revalidatePath(`/my/orders/${orderId}`);
  revalidatePath("/my/orders");
}