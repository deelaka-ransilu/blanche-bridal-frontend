"use server";

import { revalidatePath } from "next/cache";
import { fetchWithRefresh } from "@/lib/api/server";
import { PRODUCTION_STAGE_ORDER } from "@/types/production";

// ProductionStageRecordController returns the raw record with no
// {success, data} envelope (see lib/api/production.ts for the read-side
// version of this same issue) -- so these use fetchWithRefresh (raw
// Response) rather than apiRequestWithRefresh/parseResponse, which assume
// ApiResponse<T>.
//
// CONVERTED (was void-return bound directly to <form action={...}>) --
// these now return real state so the calling client components (via
// useActionState) can show what actually went wrong instead of a failure
// only showing up as "nothing changed" after revalidatePath. See
// STATUS.md Backlog: "Convert updateOrderStatusAction and production
// approve/reject/propose actions to useActionState with inline error
// surfacing."
//
// PATH NOTE: production tracking now lives ONLY on
// /admin/custom-orders/[id] (keyed by CustomDesignRequest id), not on
// /admin/orders/[id] anymore (see tracker Section 4 — that page no longer
// renders any production UI). Every action below revalidates the
// custom-orders page and takes the CustomDesignRequest id as
// customDesignRequestId, separate from the underlying orderId used to hit
// the ProductionStageRecordController endpoints (which are still keyed by
// Order id — that didn't change).

export type ProductionActionState = {
  success: boolean;
  message?: string;
} | null;

async function postProduction(
  path: string,
  body?: unknown,
  method: "POST" | "PUT" = "POST",
): Promise<ProductionActionState> {
  let res: Response;
  try {
    res = await fetchWithRefresh(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { success: false, message: "Could not reach the server. Try again." };
  }

  console.log(`[postProduction] ${path} → ${res.status}`);

  if (!res.ok) {
    // Best-effort attempt to surface the backend's actual error message
    // (GlobalExceptionHandler shapes most 4xx bodies as {message: "..."}
    // or similar) -- fall back to a generic message if the body isn't
    // JSON or doesn't have one, rather than failing silently.
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // non-JSON error body -- keep the generic message
    }
    return { success: false, message };
  }

  return { success: true };
}

export async function approveProductionAction(
  orderId: string,
  customDesignRequestId: string,
  _prevState: ProductionActionState,
  _formData: FormData,
): Promise<ProductionActionState> {
  const result = await postProduction(`/api/admin/production/${orderId}/approve`);
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return result;
}

export async function rejectProductionAction(
  orderId: string,
  customDesignRequestId: string,
  _prevState: ProductionActionState,
  formData: FormData,
): Promise<ProductionActionState> {
  const notes = (formData.get("notes") as string) || undefined;
  const result = await postProduction(`/api/admin/production/${orderId}/reject`, { notes });
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return result;
}

export async function proposeStageAction(
  orderId: string,
  _prevState: ProductionActionState,
  formData: FormData,
): Promise<ProductionActionState> {
  const pendingStage = formData.get("pendingStage") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const result = await postProduction(`/api/employee/production/${orderId}/propose`, { pendingStage, notes });
  revalidatePath(`/employee/orders/${orderId}`);
  return result;
}

export async function createProductionAction(
  orderId: string,
  customDesignRequestId: string,
  _prevState: ProductionActionState,
  _formData: FormData,
): Promise<ProductionActionState> {
  const result = await postProduction(`/api/admin/production/${orderId}`, {
    initialStage: PRODUCTION_STAGE_ORDER[0],
  });
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return result;
}

export async function assignEmployeeAction(
  orderId: string,
  customDesignRequestId: string,
  _prevState: ProductionActionState,
  formData: FormData,
): Promise<ProductionActionState> {
  const employeeId = formData.get("employeeId") as string;
  const result = await postProduction(`/api/admin/production/${orderId}/assign`, { employeeId }, "PUT");
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return result;
}

// Manual stage advance. Employee-side propose/approve flow is out of scope
// (dummy pages), so until that's rebuilt admin needs a direct way to move a
// custom order's production forward. Hits the existing
// PUT /api/admin/production/{orderId}/stage endpoint (updateStageDirect),
// which needed no backend change — it already sets status back to NONE and
// clears any pendingStage, matching "admin just declares the real stage."
export async function updateStageDirectAction(
  orderId: string,
  customDesignRequestId: string,
  _prevState: ProductionActionState,
  formData: FormData,
): Promise<ProductionActionState> {
  const stage = formData.get("stage") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const result = await postProduction(`/api/admin/production/${orderId}/stage`, { stage, notes }, "PUT");
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
  return result;
}