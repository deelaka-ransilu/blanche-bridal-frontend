"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import { getRentableProducts as getRentableProductsRead } from "@/lib/api/rentals";
import type { Order } from "@/types/order";
import type { Rental } from "@/types/rental";

export type CreateRentalBookingState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
} | null;

export type BookRentalState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
} | null;

export type UpdateRentalNotesState = {
  success: boolean;
  message?: string;
} | null;

/** Server Action wrapper so the walk-in sale panel (client component) can
 * fetch the rentable-products list without importing lib/api/rentals.ts
 * directly — same rationale as getAvailableProductsAction in products.ts. */
export async function getRentableProductsAction() {
  return getRentableProductsRead();
}

/** Posts to /api/rentals/walk-in — the walk-in-specific booking endpoint,
 * distinct from the pre-existing bare POST /api/rentals (admin manual
 * data-entry) and POST /api/rentals/book (customer self-service). See
 * RentalController's comment on createRentalBooking for why these are kept
 * separate rather than merged. */
export async function createRentalBookingAction(
  _prevState: CreateRentalBookingState,
  formData: FormData,
): Promise<CreateRentalBookingState> {
  const customerId = formData.get("customerId") as string;
  const productId = formData.get("productId") as string;
  const rentalStart = formData.get("rentalStart") as string;
  const rentalEnd = formData.get("rentalEnd") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const notes = formData.get("notes") as string;

  if (!customerId || !productId || !rentalStart || !rentalEnd) {
    return { success: false, message: "Missing required rental booking details." };
  }

  const result = await apiRequestWithRefresh<Order>(`/api/rentals/walk-in`, {
    method: "POST",
    body: JSON.stringify({
      customerId,
      productId,
      rentalStart,
      rentalEnd,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/employee/orders");

  return { success: true, message: "Rental booking created.", orderId: result.data.id };
}

/** Posts to /api/rentals/book — customer self-service booking, two-step
 * fitting-first flow. Bound with productId via .bind(null, productId) in
 * RentalBookingForm, so the action's own params start after that. */
export async function bookRentalAction(
  productId: string,
  _prevState: BookRentalState,
  formData: FormData,
): Promise<BookRentalState> {
  const size = formData.get("size") as string;
  const rentalStart = formData.get("rentalStart") as string;
  const rentalEnd = formData.get("rentalEnd") as string;
  const fittingDate = formData.get("fittingDate") as string;
  const fittingTimeSlot = formData.get("fittingTimeSlot") as string;

  if (!rentalStart || !rentalEnd) {
    return { success: false, message: "Please select both a start and end date." };
  }
  if (!fittingDate || !fittingTimeSlot) {
    return { success: false, message: "Please select a fitting date and time." };
  }

  const result = await apiRequestWithRefresh<Order>(`/api/rentals/book`, {
    method: "POST",
    body: JSON.stringify({
      productId,
      size: size || undefined,
      rentalStart,
      rentalEnd,
      fittingDate,
      fittingTimeSlot,
      paymentMethod: "CASH", // paid in person at fitting; placeholder until backend makes this optional
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  return { success: true, orderId: result.data.id };
}

export type MarkReturnedState = {
  success: boolean;
  message?: string;
  data?: Rental;
} | null;

/** PUT /api/rentals/{id}/return — ADMIN/EMPLOYEE only, per RentalController.
 * Bound via .bind(null, rental.id); form supplies returnDate, damaged,
 * damageCost. Switched to useActionState (from void-return) so the admin
 * page can display the computed damage/late/refund breakdown inline
 * instead of just silently refreshing the list. */
export async function markReturnedAction(
  id: string,
  _prevState: MarkReturnedState,
  formData: FormData,
): Promise<MarkReturnedState> {
  const returnDate =
    (formData.get("returnDate") as string) || new Date().toISOString().slice(0, 10);
  const damaged = formData.get("damaged") === "on";
  const damageCostRaw = formData.get("damageCost") as string;
  const damageCost = damaged && damageCostRaw ? Number(damageCostRaw) : undefined;

  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${id}/return`, {
    method: "PUT",
    body: JSON.stringify({ returnDate, damaged, damageCost }),
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/employee/orders");
  revalidatePath("/employee/rentals");

  return { success: true, data: result.data };
}

export type ConfirmHandoverState = {
  success: boolean;
  message?: string;
  handoverOrderId?: string;
} | null;

/** POST /api/rentals/{id}/handover — ADMIN/EMPLOYEE. Confirms dress handover,
 * creates the second (remaining 50% + security deposit) payment order. */
export async function confirmHandoverAction(
  rentalId: string,
  _prevState: ConfirmHandoverState,
  formData: FormData,
): Promise<ConfirmHandoverState> {
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!paymentMethod) {
    return { success: false, message: "Please choose a payment method." };
  }

  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${rentalId}/handover`, {
    method: "POST",
    body: JSON.stringify({ paymentMethod }),
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/employee/rentals");

  return {
    success: true,
    handoverOrderId: result.data.handoverOrderId ?? undefined,
  };
}

/** PUT /api/rentals/{id}/cancel — cancels a rental (and its linked fitting
 * appointment, handled server-side). Valid while status is PENDING_PAYMENT
 * or BOOKED, matching the same window the "Cancel" button is shown in on
 * the customer rental detail page. Void-return + console-log-on-failure,
 * same convention as cancelAppointmentAction. */
export async function cancelRentalAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${id}/cancel`, {
    method: "PUT",
  });

  if (!result.success) {
    console.error(`[cancelRentalAction] failed for ${id}: ${result.message}`);
  }

  revalidatePath(`/my/rentals/${id}`);
  revalidatePath("/my/rentals");
  revalidatePath("/admin/orders");
  revalidatePath("/employee/rentals");
}

/** PUT /api/rentals/{id}/notes — ADMIN only. Staff-facing alteration/fitting
 * notes, never surfaced on the customer detail page. */
export async function updateRentalNotesAction(
  id: string,
  _prevState: UpdateRentalNotesState,
  formData: FormData,
): Promise<UpdateRentalNotesState> {
  const notes = (formData.get("notes") as string) ?? "";

  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/${id}/notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath(`/admin/rentals/${id}`);
  revalidatePath("/admin/orders");

  return { success: true };
}