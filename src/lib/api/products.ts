import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type { Product } from "@/types/product";

// Mirrors lib/api/orders.ts: plain apiRequest, local token lookup, safe for
// use in Server Components during render (no apiRequestWithRefresh).
//
// ASSUMPTION (unconfirmed): the `available` query param on GET /api/products
// reflects real-time rental availability (i.e. excludes products currently
// ACTIVE/OVERDUE on a rental), not just stock/active-status. If
// ProductService.getProducts's filter logic means something else by
// "available," this dropdown will let staff pick already-rented products
// and hit the IllegalStateException block anyway. Needs verifying against
// ProductService/ProductSpecification before relying on this long-term.

export type ProductListResult =
  | {
      success: true;
      data: Product[];
      pagination: { page: number; size: number; total: number; totalPages: number };
    }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Public endpoint, called here for admin use — GET /api/products
 * `available=true` filters to (assumed) rentable products only.
 */
export async function getAvailableProducts(): Promise<ProductListResult> {
  const token = await getToken();
  const params = new URLSearchParams({
    page: "0",
    size: "200",
    available: "true",
  });
  const result = await apiRequest<Product[]>(
    `/api/products?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as ProductListResult;
}