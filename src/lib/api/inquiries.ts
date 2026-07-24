import { apiRequest } from "@/lib/api/client";
import { getToken } from "@/lib/api/server";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

// Same tradeoff as orders.ts: plain apiRequest (not apiRequestWithRefresh),
// since these are called from plain Server Components. Expired token fails
// the fetch with no silent refresh. See CURRENT_STATE.md.

// InquiryController wraps GET /api/inquiries as:
//   { success: true, data: InquiryResponse[], pagination: {...} }
// GET /api/inquiries/my has NO pagination sibling -- just { success, data }.

export type InquiryListResult =
  | {
      success: true;
      data: Inquiry[];
      pagination: { page: number; size: number; total: number; totalPages: number };
    }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type MyInquiryListResult =
  | { success: true; data: Inquiry[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type InquirySingleResult =
  | { success: true; data: Inquiry }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

const DEFAULT_PAGE_SIZE = 100; // pagination UI deferred, matches orders.ts convention

/**
 * Admin -- GET /api/inquiries (ADMIN or EMPLOYEE per @PreAuthorize, but
 * frontend deliberately restricts this page to Admin only -- see
 * FRONTEND_HANDOVER_V2.md scoping note).
 */
export async function getInquiries(status?: InquiryStatus): Promise<InquiryListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  if (status) params.set("status", status);
  const result = await apiRequest<Inquiry[]>(
    `/api/inquiries?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as InquiryListResult;
}

/**
 * Admin -- GET /api/inquiries/{id}
 */
export async function getInquiryById(id: string): Promise<InquirySingleResult> {
  const token = await getToken();
  const result = await apiRequest<Inquiry>(`/api/inquiries/${id}`, { method: "GET" }, token);
  return result as unknown as InquirySingleResult;
}

/**
 * Customer -- GET /api/inquiries/my (matched by account email server-side,
 * not a customerId param -- see backend service). No pagination sibling.
 */
export async function getMyInquiries(): Promise<MyInquiryListResult> {
  const token = await getToken();
  const result = await apiRequest<Inquiry[]>("/api/inquiries/my", { method: "GET" }, token);
  return result as unknown as MyInquiryListResult;
}