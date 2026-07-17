import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ProductionStageRecord } from "@/types/production";

// IMPORTANT — do NOT reuse apiRequest()/parseResponse() (client.ts) here.
//
// ProductionStageRecordController returns ProductionStageRecordResponse
// directly with no {success, data} envelope, and getForCustomer returns a
// bare 404 with no body when no record exists (Option C design: absence of
// a record is a normal, valid state — not an error).
//
// parseResponse<T>() assumes every JSON body is shaped like ApiResponse<T>.
// Fed a raw ProductionStageRecordResponse, it would JSON.parse it fine but
// then blindly cast it — result.success would be undefined and result.data
// would be undefined too, silently losing real data on a successful 200.
// So a dedicated fetch is required, not a style preference.
//
// Same session-token pattern as lib/api/orders.ts (plain apiRequest's
// underlying approach) — no apiRequestWithRefresh, for the same
// Server-Component-safety reason documented there.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ProductionResult =
  | { found: true; data: ProductionStageRecord }
  | { found: false } // no record for this order — normal, not an error
  | { found: false; error: string }; // genuine failure (network, 5xx, auth, etc.)

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Any authenticated role — GET /api/orders/{orderId}/production
 * Backend enforces ownership/role checks server-side (see
 * ProductionStageRecordController.getForCustomer, despite the method name it
 * accepts any authenticated user and the service layer scopes access).
 */
export async function getProductionForOrder(orderId: string): Promise<ProductionResult> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/orders/${orderId}/production`, {
    method: "GET",
    headers,
    credentials: "include",
  });
  console.log(`[getProductionForOrder] orderId=${orderId} status=${res.status}`);
  } catch {
    return { found: false, error: "Could not reach the server." };
  }

  if (res.status === 404) {
    // No production record for this order — order isn't a "custom" order
    // under the Option C design. Not an error.
    return { found: false };
  }

  if (!res.ok) {
    return { found: false, error: "Something went wrong loading production status." };
  }

  const text = await res.text();
  if (!text) {
    // Defensive: a 200 with empty body shouldn't happen per the controller,
    // but don't crash on JSON.parse if it does.
    return { found: false, error: "Unexpected empty response from server." };
  }

  try {
    const data = JSON.parse(text) as ProductionStageRecord;
    return { found: true, data };
  } catch {
    return { found: false, error: "Unexpected response from server." };
  }
}

type PendingApprovalsResult =
  | { success: true; data: ProductionStageRecord[] }
  | { success: false; message: string };

export async function getPendingProductionApprovals(): Promise<PendingApprovalsResult> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/admin/production/pending-approvals`, {
      method: "GET",
      headers,
      credentials: "include",
    });
  } catch {
    return { success: false, message: "Could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, message: "Something went wrong loading pending approvals." };
  }

  try {
    const data = (await res.json()) as ProductionStageRecord[];
    return { success: true, data };
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}