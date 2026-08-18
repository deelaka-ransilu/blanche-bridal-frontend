import { apiRequest } from "@/lib/api/client";
import { getToken } from "@/lib/api/server";
import type { Appointment } from "@/types/appointment";

// Same rationale as lib/api/rentals.ts / orders.ts: plain apiRequest (not
// apiRequestWithRefresh) because these are called from Server Components
// during render, where rewriting the refresh cookie is unsafe.

type Pagination = { page: number; size: number; total: number; totalPages: number };

export type AppointmentListResult =
  | { success: true; data: Appointment[]; pagination: Pagination }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

// Unlike RentalController's /my (no pagination), AppointmentController's
// getMyAppointments DOES paginate (Page<AppointmentResponse>, same as
// getAllAppointments) -- confirmed from controller source, not assumed.
export type MyAppointmentListResult = AppointmentListResult;

export type AppointmentSingleResult =
  | { success: true; data: Appointment }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type SlotsResult =
  | { success: true; data: string[] }
  | { success: false; message: string };

const DEFAULT_PAGE_SIZE = 100; // pagination UI deferred, matches orders.ts/rentals.ts convention

/**
 * Admin/Employee -- GET /api/appointments (ADMIN or EMPLOYEE role)
 */
export async function getAllAppointments(status?: string): Promise<AppointmentListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  if (status) params.set("status", status);
  const result = await apiRequest<Appointment[]>(
    `/api/appointments?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as AppointmentListResult;
}

/**
 * Customer -- GET /api/appointments/my (CUSTOMER role only)
 * NOTE: unlike rentals' /my, this DOES return a pagination block.
 */
export async function getMyAppointments(): Promise<MyAppointmentListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  const result = await apiRequest<Appointment[]>(
    `/api/appointments/my?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as MyAppointmentListResult;
}

/**
 * Any authenticated role -- GET /api/appointments/{id}
 * Backend enforces ownership server-side for customers.
 */
export async function getAppointmentById(id: string): Promise<AppointmentSingleResult> {
  const token = await getToken();
  const result = await apiRequest<Appointment>(`/api/appointments/${id}`, { method: "GET" }, token);
  return result as unknown as AppointmentSingleResult;
}

/**
 * Public (permitAll) -- GET /api/appointments/slots?date=...
 * No auth needed; also safe to call directly from a client component since
 * it doesn't touch the refresh cookie and needs no token.
 */
export async function getAvailableSlots(date: string): Promise<SlotsResult> {
  const result = await apiRequest<string[]>(`/api/appointments/slots?date=${date}`, {
    method: "GET",
  });
  return result as unknown as SlotsResult;
}