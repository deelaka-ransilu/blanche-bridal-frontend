import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type { BankDetails } from "@/types/refund";

// Same pattern as lib/api/orders.ts: plain apiRequest (not apiRequestWithRefresh)
// because this is called from a Server Component (app/admin/orders/[id]/page.tsx),
// not a Server Action.

export type BankDetailsResult =
  | { success: true; data: BankDetails }
  | { success: false; message: string; error?: string };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Admin -- GET /api/orders/{id}/bank-details
 * Returns success: false (404 from backend) if the customer hasn't
 * submitted bank details yet -- this is an expected state, not an error,
 * so callers should treat a failure here as "not submitted" rather than
 * surfacing it as a hard error.
 */
export async function getBankDetails(orderId: string): Promise<BankDetailsResult> {
  const token = await getToken();
  const result = await apiRequest<BankDetails>(
    `/api/orders/${orderId}/bank-details`,
    { method: "GET" },
    token,
  );
  return result as unknown as BankDetailsResult;
}