import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type { Rental, RentableProduct } from "@/types/rental";

// Same rationale as lib/api/orders.ts: plain apiRequest (not
// apiRequestWithRefresh) because these are called from Server Components
// during render, where rewriting the refresh cookie is unsafe.

export type RentalListResult =
  | {
      success: true;
      data: Rental[];
      pagination: { page: number; size: number; total: number; totalPages: number };
    }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

// getMyRentals has NO pagination wrapper -- RentalController.getMyRentals
// returns { success: true, data: List<RentalResponse> } directly (service
// method returns List, not Page). Kept as a separate type so callers can't
// accidentally read result.pagination on the /my endpoint.
export type MyRentalListResult =
  | { success: true; data: Rental[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type RentalSingleResult =
  | { success: true; data: Rental }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type RentableProductsResult =
  | { success: true; data: RentableProduct[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

const DEFAULT_PAGE_SIZE = 100; // pagination UI deferred, matches orders.ts convention

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Admin/Employee -- GET /api/rentals (ADMIN or EMPLOYEE role, per @PreAuthorize)
 */
export async function getAllRentals(status?: string): Promise<RentalListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: "0", size: String(DEFAULT_PAGE_SIZE) });
  if (status) params.set("status", status);
  const result = await apiRequest<Rental[]>(
    `/api/rentals?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as RentalListResult;
}

/**
 * Customer -- GET /api/rentals/my (CUSTOMER role only, per @PreAuthorize)
 * NOTE: no pagination params -- backend doesn't accept them on this endpoint.
 */
export async function getMyRentals(): Promise<MyRentalListResult> {
  const token = await getToken();
  const result = await apiRequest<Rental[]>(`/api/rentals/my`, { method: "GET" }, token);
  return result as unknown as MyRentalListResult;
}

/**
 * Any authenticated role -- GET /api/rentals/{id}
 * Backend enforces: customers can only access their own rental, staff can
 * access any rental.
 */
export async function getRentalById(id: string): Promise<RentalSingleResult> {
  const token = await getToken();
  const result = await apiRequest<Rental>(`/api/rentals/${id}`, { method: "GET" }, token);
  return result as unknown as RentalSingleResult;
}

/**
 * Admin/Employee -- GET /api/rentals/rentable-products
 * Rentable dresses (type=DRESS, available, active, not currently booked)
 * for WalkInSalePanel's select-gown step.
 */
export async function getRentableProducts(): Promise<RentableProductsResult> {
  const token = await getToken();
  const result = await apiRequest<RentableProduct[]>(
    `/api/rentals/rentable-products`,
    { method: "GET" },
    token,
  );
  return result as unknown as RentableProductsResult;
}