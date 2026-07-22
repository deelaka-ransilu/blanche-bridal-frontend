"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Appointment } from "@/types/appointment";

// Rides on the same POST /api/appointments endpoint as bookAppointmentAction
// -- type: "CUSTOM_CONSULTATION" plus the extra occasion/style/reference
// fields, which CreateAppointmentRequest now accepts as optional fields
// (see AppointmentServiceImpl.bookAppointment for the conditional required-
// ness check). No new endpoint, per the "extend, don't duplicate" decision.

export type SubmitCustomDesignState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function submitCustomDesignRequestAction(
  _prevState: SubmitCustomDesignState,
  formData: FormData,
): Promise<SubmitCustomDesignState> {
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const occasionType = formData.get("occasionType") as string;
  const occasionDate = formData.get("occasionDate") as string;
  const stylePreferences = (formData.get("stylePreferences") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  const referenceImagesRaw = (formData.get("referenceImages") as string) || "[]";

  // Client-side required-field check mirrors the backend's conditional
  // validation for CUSTOM_CONSULTATION in AppointmentServiceImpl -- this is
  // just a fast fail before hitting the network, the backend still enforces
  // it regardless.
  const fields: Record<string, string> = {};
  if (!appointmentDate) fields.appointmentDate = "Pick a date for your consultation.";
  if (!timeSlot) fields.timeSlot = "Pick a time slot.";
  if (!occasionType) fields.occasionType = "Select an occasion type.";
  if (!occasionDate) fields.occasionDate = "Let us know your event date.";

  if (Object.keys(fields).length > 0) {
    return { success: false, message: "Please fill in the required fields.", fields };
  }

  // The hidden field is populated client-side as JSON.stringify(url[]) --
  // plain Cloudinary URL strings, matching CreateAppointmentRequest's
  // `List<String> referenceImages` on the backend. Not {url, id, publicId}
  // objects -- that shape only exists transiently in ImageUploader's
  // UploadedImage state.
  let referenceImages: string[] = [];
  try {
    const parsed = JSON.parse(referenceImagesRaw);
    if (Array.isArray(parsed)) {
      referenceImages = parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
    }
  } catch {
    // malformed image payload -- non-critical, proceed without images
  }

  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments`, {
    method: "POST",
    body: JSON.stringify({
      appointmentDate,
      timeSlot,
      type: "CUSTOM_CONSULTATION",
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

  revalidatePath("/my/appointments");
  return {
    success: true,
    message:
      "Thanks! Your custom design consultation request has been submitted. We'll be in touch to confirm.",
  };
}