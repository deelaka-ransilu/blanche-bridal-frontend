import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

export async function getCustomDesignRequestById(id: string): Promise<CustomDesignRequestResult> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/custom-design-requests/${id}`, {
      method: "GET",
      headers,
      credentials: "include",
    });
  } catch {
    return { success: false, message: "Could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, message: "Something went wrong loading this custom order." };
  }

  try {
    const body = (await res.json()) as { success: boolean; data: CustomDesignRequest };
    return { success: true, data: body.data };
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}

export type CustomOrderSummary = {
  id: string;
  customerName: string;
  customerEmail: string;
  occasionDate: string;
  firstPaymentOrderId: string;
  secondPaymentOrderId: string | null;
  firstPaymentStatus: string;
  currentProductionStage: string | null;
  createdAt: string;
};

export type CustomOrderSummaryResult =
  | { success: true; data: CustomOrderSummary[] }
  | { success: false; message: string };

export async function getAllCustomOrders(): Promise<CustomOrderSummaryResult> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/custom-design-requests`, {
      method: "GET",
      headers,
      credentials: "include",
    });
  } catch {
    return { success: false, message: "Could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, message: "Something went wrong loading custom orders." };
  }

  try {
    const body = (await res.json()) as { success: boolean; data: CustomOrderSummary[] };
    return { success: true, data: body.data };
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}
