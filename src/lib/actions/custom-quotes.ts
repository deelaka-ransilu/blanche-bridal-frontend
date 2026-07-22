"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { CustomQuote, SplitType } from "@/lib/api/custom-quotes";

export type CreateCustomQuoteRequest = {
  fabricAmount: number;
  laborAmount: number;
  embellishmentAmount: number;
  alterationsAmount: number;
  otherAmount: number;
  otherNote?: string;
  splitType: SplitType;
};

export type CreateQuoteState =
  | { success: true; data: CustomQuote }
  | { success: false; message: string }
  | null;

/**
 * ADMIN -- POST /api/custom-design-requests/{id}/quotes
 * Creates a new CustomQuote version against a CustomDesignRequest. Backend
 * rejects (400) if the latest quote is still PENDING and not expired --
 * see CustomQuoteServiceImpl.createQuote. otherNote is required server-side
 * only when otherAmount > 0; validated here too so the error surfaces
 * before the round-trip.
 */
export async function createQuoteAction(
  customDesignRequestId: string,
  _prevState: CreateQuoteState,
  formData: FormData,
): Promise<CreateQuoteState> {
  const fabricAmount = Number(formData.get("fabricAmount"));
  const laborAmount = Number(formData.get("laborAmount"));
  const embellishmentAmount = Number(formData.get("embellishmentAmount"));
  const alterationsAmount = Number(formData.get("alterationsAmount"));
  const otherAmount = Number(formData.get("otherAmount"));
  const otherNote = String(formData.get("otherNote") ?? "").trim();
  const splitType = String(formData.get("splitType")) as SplitType;

  for (const [label, value] of [
    ["Fabric & materials", fabricAmount],
    ["Stitching / labor", laborAmount],
    ["Embellishments / detailing", embellishmentAmount],
    ["Alterations & fitting", alterationsAmount],
    ["Other / miscellaneous", otherAmount],
  ] as const) {
    if (Number.isNaN(value) || value < 0) {
      return { success: false, message: `${label} must be a valid, non-negative amount.` };
    }
  }
  if (otherAmount > 0 && otherNote.length === 0) {
    return { success: false, message: "A note is required when there's an 'other' amount." };
  }

  const body: CreateCustomQuoteRequest = {
    fabricAmount,
    laborAmount,
    embellishmentAmount,
    alterationsAmount,
    otherAmount,
    splitType,
    ...(otherNote.length > 0 ? { otherNote } : {}),
  };

  const result = await apiRequestWithRefresh<CustomQuote>(
    `/api/custom-design-requests/${customDesignRequestId}/quotes`,
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);

  return { success: true, data: result.data };
}

export type RespondQuoteState =
  | { success: true; data: CustomQuote }
  | { success: false; message: string }
  | null;

/**
 * CUSTOMER -- POST /api/quotes/{quoteId}/approve
 * Approving triggers the backend to create the real first-payment Order
 * (isCustomOrder=true, 50% or full amount depending on splitType) -- see
 * CustomQuoteServiceImpl.approveQuote.
 */
export async function approveQuoteAction(
  quoteId: string,
  customDesignRequestId: string,
  _prevState: RespondQuoteState,
  _formData: FormData,
): Promise<RespondQuoteState> {
  const result = await apiRequestWithRefresh<CustomQuote>(
    `/api/quotes/${quoteId}/approve`,
    { method: "POST" },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/my/custom-design/${customDesignRequestId}`);
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);

  return { success: true, data: result.data };
}

/**
 * CUSTOMER -- POST /api/quotes/{quoteId}/reject
 * Rejecting does not delete the quote -- it stays visible as history, and
 * admin creates a new version against the same CustomDesignRequest.
 */
export async function rejectQuoteAction(
  quoteId: string,
  customDesignRequestId: string,
  _prevState: RespondQuoteState,
  formData: FormData,
): Promise<RespondQuoteState> {
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length === 0) {
    return { success: false, message: "A reason is required to reject this quote." };
  }

  const result = await apiRequestWithRefresh<CustomQuote>(
    `/api/quotes/${quoteId}/reject`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/my/custom-design/${customDesignRequestId}`);
  revalidatePath(`/admin/custom-orders/${customDesignRequestId}`);

  return { success: true, data: result.data };
}