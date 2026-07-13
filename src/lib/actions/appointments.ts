"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Appointment } from "@/types/appointment";

// ── Booking (useActionState — inline error feedback) ───────────────────────
// Same rationale as createRentalAction: a booking conflict / bad slot is a
// frequent, expected, actionable validation error for the customer filling
// the form -- not something to bury in the server console.

export type BookAppointmentState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function bookAppointmentAction(
  _prevState: BookAppointmentState,
  formData: FormData,
): Promise<BookAppointmentState> {
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;

  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments`, {
    method: "POST",
    body: JSON.stringify({
      appointmentDate,
      timeSlot,
      type,
      notes: notes || undefined,
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/my/appointments");
  redirect("/my/appointments?booked=true");
}

// ── Standard mutations (void-return, console-log-on-failure) ───────────────
// Same convention as lib/actions/orders.ts / rentals.ts. All these endpoints
// return { success, data } via Map.of(...), no envelope workaround needed.

export async function confirmAppointmentAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments/${id}/confirm`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[confirmAppointmentAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/appointments");
}

export async function completeAppointmentAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments/${id}/complete`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[completeAppointmentAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/appointments");
}

export async function cancelAppointmentAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments/${id}/cancel`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[cancelAppointmentAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/appointments");
  revalidatePath("/my/appointments");
}

export async function rescheduleAppointmentAction(id: string, formData: FormData): Promise<void> {
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot = formData.get("timeSlot") as string;

  const result = await apiRequestWithRefresh<Appointment>(`/api/appointments/${id}/reschedule`, {
    method: "PUT",
    body: JSON.stringify({ appointmentDate, timeSlot }),
  });

  if (!result.success) {
    console.error(`[rescheduleAppointmentAction] failed for ${id}: ${result.message}`);
  }

  revalidatePath("/admin/appointments");
  revalidatePath("/my/appointments");
}