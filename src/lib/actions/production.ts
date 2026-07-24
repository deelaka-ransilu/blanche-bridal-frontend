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
// NOTE ON RETURN TYPE: these are bound directly to <form action={...}>, which
// per React's types requires (formData: FormData) => void | Promise<void>.
// Returning the result object (as an earlier version of this file did) fails
// type-checking. So these intentionally return void -- success/failure is
// only reflected via revalidatePath's refetch, with no inline error message
// shown on failure yet. A proper fix (showing "rejected: <reason>" etc.)
// needs the tracker's forms converted to client components using
// useActionState, which is a reasonable fast-follow, not done in this pass.
//
// PATH NOTE: production tracking now lives ONLY on
// /admin/custom-orders/[id] (keyed by CustomDesignRequest id), not on
// /admin/orders/[id] anymore (see tracker Section 4 — that page no longer
// renders any production UI). Every action below revalidates the
// custom-orders page and takes the CustomDesignRequest id as
// customDesignRequestId, separate from the underlying orderId used to hit
// the ProductionStageRecordController endpoints (which are still keyed by
// Order id — that didn't change).

async function postProduction(path: string, body?: unknown, method: "POST" | "PUT" = "POST"): Promise<void> {
  const res = await fetchWithRefresh(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log(`[postProduction] ${path} → ${res.status}`);

  // Intentionally swallowing failure detail here -- see file-level note above
  // on why these actions return void. If res is not ok, the UI simply won't
  // show the expected change after revalidation, which is a known gap.
  if (!res.ok) {
    console.error(`[production action] ${path} failed with status ${res.status}`);
  }
}

export async function approveProductionAction(orderId: string, customDesignRequestId: string): Promise<void> {
  await postProduction(`/api/admin/production/${orderId}/approve`);
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
}

export async function rejectProductionAction(
  orderId: string,
  customDesignRequestId: string,
  formData: FormData
): Promise<void> {
  const notes = (formData.get("notes") as string) || undefined;
  await postProduction(`/api/admin/production/${orderId}/reject`, { notes });
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
}

export async function proposeStageAction(orderId: string, formData: FormData): Promise<void> {
  const pendingStage = formData.get("pendingStage") as string;
  const notes = (formData.get("notes") as string) || undefined;
  await postProduction(`/api/employee/production/${orderId}/propose`, { pendingStage, notes });
  revalidatePath(`/employee/orders/${orderId}`);
}

export async function createProductionAction(orderId: string, customDesignRequestId: string): Promise<void> {
  await postProduction(`/api/admin/production/${orderId}`, {
    initialStage: PRODUCTION_STAGE_ORDER[0],
  });
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
}

export async function assignEmployeeAction(
  orderId: string,
  customDesignRequestId: string,
  formData: FormData
): Promise<void> {
  const employeeId = formData.get("employeeId") as string;
  await postProduction(`/api/admin/production/${orderId}/assign`, { employeeId }, "PUT");
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
}

// NEW — manual stage advance. Employee-side propose/approve flow is out of
// scope (dummy pages), so until that's rebuilt admin needs a direct way to
// move a custom order's production forward. Hits the existing
// PUT /api/admin/production/{orderId}/stage endpoint (updateStageDirect),
// which needed no backend change — it already sets status back to NONE and
// clears any pendingStage, matching "admin just declares the real stage."
export async function updateStageDirectAction(
  orderId: string,
  customDesignRequestId: string,
  formData: FormData
): Promise<void> {
  const stage = formData.get("stage") as string;
  const notes = (formData.get("notes") as string) || undefined;
  await postProduction(`/api/admin/production/${orderId}/stage`, { stage, notes }, "PUT");
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);
}