"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import { getRentableProducts as getRentableProductsRead } from "@/lib/api/rentals";
import type { Order } from "@/types/order";

export type CreateRentalBookingState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
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