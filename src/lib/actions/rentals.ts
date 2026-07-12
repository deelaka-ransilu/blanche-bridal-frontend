"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Rental } from "@/types/rental";

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
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/rentals");
  revalidatePath("/employee/rentals");
  return { success: true, message: "Rental created." };
}

export type BookRentalState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
} | null;

export async function bookRentalAction(
  productId: string,
  _prevState: BookRentalState,
  formData: FormData,
): Promise<BookRentalState> {
  const rentalStart = formData.get("rentalStart") as string;
  const rentalEnd = formData.get("rentalEnd") as string;

  // paymentMethod dropped from the payload — rentals are cash-only now,
  // the backend hardcodes it (RentalServiceImpl.bookRental()).
  const result = await apiRequestWithRefresh<Rental>(`/api/rentals/book`, {
    method: "POST",
    body: JSON.stringify({ productId, rentalStart, rentalEnd }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/my/rentals");

  return {
    success: true,
    message: "Booking created.",
    orderId: result.data.orderId ?? undefined,
  };
}