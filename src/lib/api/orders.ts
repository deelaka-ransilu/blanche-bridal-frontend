import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type { Order } from "@/types/order";

// IMPORTANT: using plain apiRequest (client.ts), NOT apiRequestWithRefresh
// (server.ts). apiRequestWithRefresh's own doc comment says it must only be
// called from a Server Action or Route Handler, because a successful refresh
// rewrites the httpOnly refreshToken cookie, which Next.js forbids during a
// Server Component render. These functions ARE called from plain Server
// Components (app/admin/orders/page.tsx, app/my/orders/page.tsx), so using
// apiRequestWithRefresh here would risk a crash-on-expiry once the 401-vs-403
// bug (CURRENT_STATE.md issue) gets fixed and refresh actually starts firing.
//
// Tradeoff accepted for now: an expired access token here just fails the
// fetch with no silent refresh, instead of refreshing transparently. Follow-up
// needed (route-handler-based refresh, or middleware) -- see CURRENT_STATE.md.

// OrderController wraps list endpoints as:
//   { success: true, data: OrderResponse[], pagination: { page, size, total, totalPages } }
// This has an extra `pagination` key that ApiResponse<T> (client.ts) doesn't
// model -- cast through unknown to reclaim it at the call site.

export type OrderListResult =
  | {
      success: true;
      data: Order[];
      pagination: { page: number; size: number; total: number; totalPages: number };
    }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type OrderSingleResult =
  | { success: true; data: Order }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

const DEFAULT_PAGE_SIZE = 100; // pagination UI deferred, see CURRENT_STATE.md

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Admin/Employee -- GET /api/orders (ADMIN or EMPLOYEE role, per @PreAuthorize)
 */
export async function getAllOrders(status?: string): Promise<OrderListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  if (status) params.set("status", status);
  const result = await apiRequest<Order[]>(
    `/api/orders?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as OrderListResult;
}

/**
 * Customer -- GET /api/orders/my (CUSTOMER role only, per @PreAuthorize)
 */
export async function getMyOrders(): Promise<OrderListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  const result = await apiRequest<Order[]>(
    `/api/orders/my?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as OrderListResult;
}

/**
 * Any authenticated role -- GET /api/orders/{id}
 * Backend enforces: customers can only access their own order, staff can
 * access any order.
 */
export async function getOrderById(id: string): Promise<OrderSingleResult> {
  const token = await getToken();
  const result = await apiRequest<Order>(`/api/orders/${id}`, { method: "GET" }, token);
  return result as unknown as OrderSingleResult;
}