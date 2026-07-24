import { apiRequest } from "@/lib/api/client";
import { getToken } from "@/lib/api/server";
import type { Product, ProductDetail, ProductType } from "@/types/product";

// Mirrors lib/api/orders.ts: plain apiRequest, shared token lookup, safe for
// use in Server Components during render (no apiRequestWithRefresh).
//
// CONFIRMED (session 2026-07-05): the `available` query param on GET
// /api/products now correctly excludes products currently ACTIVE/OVERDUE on
// a rental, via a subquery added to ProductSpecification — no longer just a
// static admin flag. Verified via manual smoke test (rent → disappears from
// available=true; mark returned → reappears). Prior assumption-flagging
// comment removed as resolved.

export type ProductListResult =
  | {
      success: true;
      data: Product[];
      pagination: { page: number; size: number; total: number; totalPages: number };
    }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type ProductDetailResult =
  | { success: true; data: ProductDetail }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

/**
 * Public endpoint, called here for admin use — GET /api/products
 * `available=true` filters to rentable-right-now products only (confirmed).
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

export type ProductQuery = {
  type?: ProductType;
  categoryId?: string;
  search?: string;
  page?: number;
  size?: number;
};

/**
 * Public catalog listing — GET /api/products
 * No `available` filter applied here on purpose: the public catalog should
 * show everything active/browsable (is_active only, enforced server-side),
 * not just rental-available stock — a sold-out or currently-rented dress is
 * still something a visitor should be able to see and inquire about.
 */
export async function getProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const params = new URLSearchParams({
    page: String(query.page ?? 0),
    size: String(query.size ?? 20),
  });
  if (query.type) params.set("type", query.type);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.search) params.set("search", query.search);

  const result = await apiRequest<Product[]>(
    `/api/products?${params.toString()}`,
    { method: "GET" },
  );
  return result as unknown as ProductListResult;
}

/** Public detail read — GET /api/products/slug/{slug} */
export async function getProductBySlug(slug: string): Promise<ProductDetailResult> {
  const result = await apiRequest<ProductDetail>(
    `/api/products/slug/${encodeURIComponent(slug)}`,
    { method: "GET" },
  );
  return result as unknown as ProductDetailResult;
}

/** Admin: get single product by ID (edit form needs this — public catalog uses slug) */
export async function getProductById(id: string): Promise<ProductDetailResult> {
  const token = await getToken();
  const result = await apiRequest<ProductDetail>(
    `/api/products/${id}`,
    { method: "GET" },
    token,
  );
  return result as unknown as ProductDetailResult;
}

/** Admin: full unfiltered list, paginated, no `available` narrowing — for the management table.
 * Optional `type` filters to DRESS or ACCESSORY only (used by Rentals panel). */
export async function getAllProductsAdmin(
  page = 0,
  size = 50,
  type?: ProductType,
): Promise<ProductListResult> {
  const token = await getToken();
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (type) params.set("type", type);
  const result = await apiRequest<Product[]>(
    `/api/products?${params.toString()}`,
    { method: "GET" },
    token,
  );
  return result as unknown as ProductListResult;
}

/** Admin: list soft-deleted (inactive) products, for the "Deactivated" restore panel */
export async function getDeletedProducts(): Promise<ProductListResult> {
  const token = await getToken();
  const result = await apiRequest<Product[]>(
    `/api/products/deleted`,
    { method: "GET" },
    token,
  );
  return result as unknown as ProductListResult;
}

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export type UploadSignatureResult =
  | { success: true; data: UploadSignature }
  | { success: false; message: string; error?: string };

/**
 * Signed Cloudinary upload params — GET /api/products/upload-signature
 * `context` selects which server-side folder allowlist entry to sign into
 * ("product" = admin-only, "blanche-bridal/products"; "custom-design" =
 * customer-facing, "blanche-bridal/custom-design-references"). The backend
 * resolves the actual folder from this key — it's never passed as a raw
 * path — and re-checks ADMIN itself for the "product" context regardless
 * of what the caller sends, so this is a convenience default, not a trust
 * boundary.
 */
export async function getUploadSignature(
  context: string = "product",
): Promise<UploadSignatureResult> {
  const token = await getToken();
  const result = await apiRequest<UploadSignature>(
    `/api/products/upload-signature?context=${encodeURIComponent(context)}`,
    { method: "GET" },
    token,
  );
  return result as unknown as UploadSignatureResult;
}