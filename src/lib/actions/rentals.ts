"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Rental } from "@/types/rental";

// ── Standard mutations (void-return, console-log-on-failure) ──────────────
// Same convention as lib/actions/orders.ts. RentalController's /return and
// /balance endpoints both return { success, data } via Map.of(...), so no
// envelope workaround needed.

export async function markReturnedAction(rentalId: string, formData: FormData): Promise<void> {
  const returnDate = formData.get("returnDate") as string;
  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${rentalId}/return`, {
    method: "PUT",
    body: JSON.stringify({ returnDate }),
  });

  if (!result.success) {
    console.error(`[markReturnedAction] failed for rental ${rentalId}: ${result.message}`);
  }

  revalidatePath(`/admin/rentals`);
  revalidatePath(`/employee/rentals`);
}

export async function updateBalanceAction(rentalId: string, formData: FormData): Promise<void> {
  const balanceDue = formData.get("balanceDue") as string;
  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${rentalId}/balance`, {
    method: "PUT",
    body: JSON.stringify({ balanceDue: Number(balanceDue) }),
  });

  if (!result.success) {
    console.error(`[updateBalanceAction] failed for rental ${rentalId}: ${result.message}`);
  }

  revalidatePath(`/admin/rentals`);
}

// ── Create rental (useActionState — inline error feedback) ────────────────
// First mutation in this codebase to use useActionState instead of the
// void-return convention. Rationale (see CURRENT_STATE.md Issue #14): the
// active-rental block (IllegalStateException -> 400 BUSINESS_RULE_VIOLATION,
// see GlobalExceptionHandler) is a specific, expected, frequent validation
// failure for staff creating rentals manually as a stopgap for the missing
// payment auto-creation flow (Issue #1) -- not an edge case worth burying in
// the server console. Scope is intentionally narrow: only this action uses
// this pattern for now, not a blanket conversion of markReturned/updateBalance.

export type CreateRentalState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function createRentalAction(
  _prevState: CreateRentalState,
  formData: FormData,
): Promise<CreateRentalState> {
  const productId = formData.get("productId") as string;
  const userId = formData.get("userId") as string;
  const rentalStart = formData.get("rentalStart") as string;
  const rentalEnd = formData.get("rentalEnd") as string;
  const depositAmount = formData.get("depositAmount") as string;
  const notes = formData.get("notes") as string;
  const orderId = formData.get("orderId") as string;

  const result = await apiRequestWithRefresh<Rental>(`/api/rentals`, {
    method: "POST",
    body: JSON.stringify({
      productId,
      userId,
      rentalStart,
      rentalEnd,
      depositAmount: depositAmount ? Number(depositAmount) : undefined,
      notes: notes || undefined,
      orderId: orderId || undefined,
    }),
  });

  if (!result.success) {
    // Covers BUSINESS_RULE_VIOLATION (active-rental block), VALIDATION_ERROR
    // (per-field), RESOURCE_NOT_FOUND (bad productId/userId), and the
    // catch-all INTERNAL_ERROR -- all arrive as { success:false, message,
    // error?, fields? } per GlobalExceptionHandler, so this branch is
    // sufficient without a raw-body fallback.
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/rentals");
  revalidatePath("/employee/rentals");
  return { success: true, message: "Rental created." };
}