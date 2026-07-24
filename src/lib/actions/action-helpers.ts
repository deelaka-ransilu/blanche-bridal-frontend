// src/lib/actions/action-helpers.ts
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/api/client";

export type OrderActionState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  orderId?: string;
} | null;

/** Shared tail for order-creating actions (plain orders + rental walk-in
 * bookings) that both revalidate "/admin/orders" + "/employee/orders" and
 * return { success, message, orderId } on success. */
export function finishOrderCreate<T extends { id: string }>(
  result: ApiResponse<T>,
  successMessage: string,
): OrderActionState {
  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/employee/orders");

  return { success: true, message: successMessage, orderId: result.data.id };
}

/** Shared parser for the hidden referenceImages field used by both the
 * customer-facing custom-design request form and the admin walk-in
 * version — populated client-side as JSON.stringify(url[]), plain
 * Cloudinary URL strings matching CreateAppointmentRequest's
 * `List<String> referenceImages` on the backend. */
export function parseReferenceImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
    }
  } catch {
    // malformed image payload -- non-critical, proceed without images
  }
  return [];
}
