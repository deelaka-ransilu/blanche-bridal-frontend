import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type {
  RevenueReportItem,
  RefundReportItem,
  DiscountReportItem,
  SummaryReport,
} from "@/types/report";

// GET-only reads under /api/admin/reports -- plain apiRequest (client.ts),
// NOT apiRequestWithRefresh (server.ts) -- these are called from a plain
// Server Component (app/admin/reports/page.tsx), same reasoning as
// lib/api/orders.ts's header comment: apiRequestWithRefresh must only be
// called from a Server Action / Route Handler.
//
// All four endpoints return { success, data } per BACKEND_HANDOVER_V2.md.

export type ReportResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; error?: string };

function buildQuery(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

export async function getRevenueReport(
  from?: string,
  to?: string,
): Promise<ReportResult<RevenueReportItem[]>> {
  const token = await getToken();
  const result = await apiRequest<RevenueReportItem[]>(
    `/api/admin/reports/revenue${buildQuery(from, to)}`,
    { method: "GET" },
    token,
  );
  return result as ReportResult<RevenueReportItem[]>;
}

export async function getRefundReport(
  from?: string,
  to?: string,
): Promise<ReportResult<RefundReportItem[]>> {
  const token = await getToken();
  const result = await apiRequest<RefundReportItem[]>(
    `/api/admin/reports/refunds${buildQuery(from, to)}`,
    { method: "GET" },
    token,
  );
  return result as ReportResult<RefundReportItem[]>;
}

export async function getDiscountReport(
  from?: string,
  to?: string,
): Promise<ReportResult<DiscountReportItem[]>> {
  const token = await getToken();
  const result = await apiRequest<DiscountReportItem[]>(
    `/api/admin/reports/discounts${buildQuery(from, to)}`,
    { method: "GET" },
    token,
  );
  return result as ReportResult<DiscountReportItem[]>;
}

export async function getSummaryReport(
  from?: string,
  to?: string,
): Promise<ReportResult<SummaryReport>> {
  const token = await getToken();
  const result = await apiRequest<SummaryReport>(
    `/api/admin/reports/summary${buildQuery(from, to)}`,
    { method: "GET" },
    token,
  );
  return result as ReportResult<SummaryReport>;
}