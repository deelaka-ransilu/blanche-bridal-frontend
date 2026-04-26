import { apiRequest } from "./client";
import {
  AppointmentResponse,
  AppointmentStatus,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types";

export const getAvailableSlots = async (date: string): Promise<string[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/appointments/slots?date=${date}`,
  );
  const json = await res.json();
  return json.data ?? [];
};

export const getAllAppointments = (
  token: string,
  status?: AppointmentStatus,
  page = 0,
) => {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiRequest<AppointmentResponse[]>(
    `/api/appointments?${params}`,
    {},
    token,
  );
};

export const getMyAppointments = (token: string, page = 0) =>
  apiRequest<AppointmentResponse[]>(
    `/api/appointments/my?page=${page}`,
    {},
    token,
  );

export const getAppointmentById = (id: string, token: string) =>
  apiRequest<AppointmentResponse>(`/api/appointments/${id}`, {}, token);

export const bookAppointment = (
  data: CreateAppointmentPayload,
  token: string,
) =>
  apiRequest<AppointmentResponse>(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );

export const confirmAppointment = (id: string, token: string) =>
  apiRequest<AppointmentResponse>(
    `/api/appointments/${id}/confirm`,
    { method: "PUT" },
    token,
  );

export const cancelAppointment = (id: string, token: string) =>
  apiRequest<AppointmentResponse>(
    `/api/appointments/${id}/cancel`,
    { method: "PUT" },
    token,
  );

export const rescheduleAppointment = (
  id: string,
  data: RescheduleAppointmentPayload,
  token: string,
) =>
  apiRequest<AppointmentResponse>(
    `/api/appointments/${id}/reschedule`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token,
  );

export const completeAppointment = (id: string, token: string) =>
  apiRequest<AppointmentResponse>(
    `/api/appointments/${id}/complete`,
    { method: "PUT" },
    token,
  );
