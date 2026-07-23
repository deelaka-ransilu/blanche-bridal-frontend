"use server";

import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Appointment } from "@/types/appointment";

export type CreateCustomDesignWalkInState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
  customDesignRequestId?: string;
} | null;

/** POST /api/appointments/walk-in — ADMIN only. Mirrors createRentalBookingAction
 * in rentals.ts: an explicit customerId instead of the JWT-derived user, since
 * staff are booking on behalf of a walk-in customer. Creates the CUSTOM_CONSULTATION
 * Appointment + its CustomDesignRequest in one call — see
 * AppointmentServiceImpl.bookWalkInCustomDesignRequest. */
export async function createCustomDesignWalkInAction(
  _prevState: CreateCustomDesignWalkInState,
  formData: FormData,
): Promise<CreateCustomDesignWalkInState> {
  const customerId = formData.get("customerId") as string;
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const occasionType = formData.get("occasionType") as string;
  const occasionDate = formData.get("occasionDate") as string;
  const stylePreferences = (formData.get("stylePreferences") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  const referenceImagesRaw = (formData.get("referenceImages") as string) || "[]";

  const fields: Record<string, string> = {};
  if (!customerId) fields.customerId = "Select a customer.";
  if (!appointmentDate) fields.appointmentDate = "Pick a consultation date.";
  if (!timeSlot) fields.timeSlot = "Pick a time slot.";
  if (!occasionType) fields.occasionType = "Select an occasion type.";
  if (!occasionDate) fields.occasionDate = "Pick an occasion date.";

  if (Object.keys(fields).length > 0) {
    return { success: false, message: "Please fill in the required fields.", fields };
  }

  let referenceImages: string[] = [];
  try {
    const parsed = JSON.parse(referenceImagesRaw);
    if (Array.isArray(parsed)) {
      referenceImages = parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
    }
  } catch {
    // non-critical, proceed without images
  }

  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments/walk-in`, {
    method: "POST",
    body: JSON.stringify({
      customerId,
      appointmentDate,
      timeSlot,
      occasionType,
      occasionDate,
      stylePreferences: stylePreferences || undefined,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      notes: notes || undefined,
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  return {
    success: true,
    message: "Custom design request created.",
    customDesignRequestId: result.data.customDesignRequestId ?? undefined,
  };
}