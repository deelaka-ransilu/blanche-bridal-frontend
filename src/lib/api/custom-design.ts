import { getToken } from "@/lib/api/server";
import type { OccasionType } from "@/types/appointment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Matches CustomDesignRequestResponse exactly. Unlike production.ts, this
// endpoint returns the standard {success, data} envelope, so a normal
// parseResponse-style shape is fine here.
export type CustomDesignRequest = {
  id: string;
  appointmentId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentStatus: string;
  appointmentNotes: string | null;
  occasionType: OccasionType;
  occasionDate: string;
  stylePreferences: string | null;
  referenceImages: string[];
  firstPaymentOrderId: string | null;
  secondPaymentOrderId: string | null;
  createdAt: string;
};

export type CustomDesignRequestResult =
  | { success: true; data: CustomDesignRequest }
  | { success: false; message: string };

export type CustomOrderSummary = {
  id: string;
  customerName: string;
  customerEmail: string;
  occasionDate: string;
  firstPaymentOrderId: string | null;
  secondPaymentOrderId: string | null;
  firstPaymentStatus: string | null;
  currentProductionStage: string | null;
  createdAt: string;
};

export type CustomOrderSummaryResult =
  | { success: true; data: CustomOrderSummary[] }
  | { success: false; message: string };

async function getJson<T>(path: string, notFoundMessage: string): Promise<{ success: true; data: T } | { success: false; message: string }> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers,
      credentials: "include",
    });
  } catch {
    return { success: false, message: "Could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, message: notFoundMessage };
  }

  try {
    const body = (await res.json()) as { success: boolean; data: T };
    return { success: true, data: body.data };
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}

export async function getCustomDesignRequestById(id: string): Promise<CustomDesignRequestResult> {
  return getJson<CustomDesignRequest>(
    `/api/custom-design-requests/${id}`,
    "Something went wrong loading this custom order.",
  );
}

export async function getAllCustomOrders(): Promise<CustomOrderSummaryResult> {
  return getJson<CustomOrderSummary[]>(
    `/api/custom-design-requests`,
    "Something went wrong loading custom orders.",
  );
}

export async function getMyCustomOrders(): Promise<CustomOrderSummaryResult> {
  return getJson<CustomOrderSummary[]>(
    `/api/custom-design-requests/my`,
    "Something went wrong loading your custom orders.",
  );
}