import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type SplitType = "FIFTY_FIFTY" | "FULL_UPFRONT";
export type QuoteStatus = "PENDING" | "APPROVED" | "REJECTED";

// Matches CustomQuoteResponse — includes the server-computed isExpired flag
// (never trust a client-side date comparison for this; validUntil is
// computed against server time on every read, per the tracker's design).
export type CustomQuote = {
  id: string;
  customDesignRequestId: string;
  version: number;
  fabricAmount: number;
  laborAmount: number;
  embellishmentAmount: number;
  alterationsAmount: number;
  otherAmount: number;
  otherNote: string | null;
  totalAmount: number;
  splitType: SplitType;
  status: QuoteStatus;
  rejectionReason: string | null;
  validUntil: string;
  isExpired: boolean;
  createdAt: string;
};

type ApiResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: "GET", headers, credentials: "include" });
  } catch {
    return { success: false, message: "Could not reach the server." };
  }

  // No quote submitted yet is a normal state for a fresh consultation —
  // surface it as a typed "not found" rather than a generic failure.
  if (res.status === 404) {
    return { success: false, message: "NOT_FOUND" };
  }
  if (!res.ok) {
    return { success: false, message: "Something went wrong loading the quote." };
  }

  try {
    const body = (await res.json()) as { success: boolean; data: T };
    return { success: true, data: body.data };
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}

export async function getLatestQuote(customDesignRequestId: string): Promise<ApiResult<CustomQuote>> {
  return getJson<CustomQuote>(`/api/custom-design-requests/${customDesignRequestId}/quotes/latest`);
}

export async function getQuoteHistory(customDesignRequestId: string): Promise<ApiResult<CustomQuote[]>> {
  return getJson<CustomQuote[]>(`/api/custom-design-requests/${customDesignRequestId}/quotes`);
}