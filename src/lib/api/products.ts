import { apiRequest } from "./client";
import {
  Category,
  ProductDetail,
  ProductFilters,
  ProductSummary,
  PaginatedResponse,
  Review,
  CreateProductPayload,
  UpdateProductPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateReviewPayload,
  ReviewStatus,
} from "@/types";

/**
 * STUBBED — Step 3 (Catalog) hasn't been built on this branch yet. Every
 * /api/products, /api/categories, and /api/reviews endpoint this file calls
 * returns 404 against the current backend. Function signatures are preserved
 * so existing call sites across the app still type-check; bodies return
 * empty/placeholder data instead of unwrapping `res.data!` against a contract
 * that doesn't exist yet (the original code's `res.data!` calls were the
 * source of the tsc errors — `!` asserts success unconditionally, which broke
 * once ApiResponse became a real discriminated union).
 *
 * TODO (Step 3): replace every function body below with the real
 * apiRequest call once Product/Category/Review entities + endpoints exist.
 * Do NOT just delete the `!` assertions and call it done — actually handle
 * the failure case (res.success === false) the way the rest of the codebase
 * now does post-Step-0.
 */

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  // TODO (Step 3): const res = await apiRequest<Category[]>("/api/categories");
  // return res.success ? res.data : [];
  return [];
}

export async function createCategory(
  data: CreateCategoryPayload,
  token?: string,
): Promise<Category> {
  throw new Error("createCategory: Step 3 (Catalog) not implemented yet.");
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryPayload,
  token?: string,
): Promise<Category> {
  throw new Error("updateCategory: Step 3 (Catalog) not implemented yet.");
}

export async function deleteCategory(
  id: string,
  token?: string,
): Promise<void> {
  throw new Error("deleteCategory: Step 3 (Catalog) not implemented yet.");
}

export async function getDeletedCategories(
  token: string,
): Promise<{ success: true; data: Category[] } | { success: false; message: string }> {
  return { success: true, data: [] };
}

export async function restoreCategory(
  id: string,
  token: string,
): Promise<Category> {
  throw new Error("restoreCategory: Step 3 (Catalog) not implemented yet.");
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductSummary>> {
  // TODO (Step 3): rebuild the real query + apiRequest call once /api/products exists.
  return {
    data: [],
    pagination: { page: 0, size: 0, total: 0, totalPages: 0 },
  } as unknown as PaginatedResponse<ProductSummary>;
}

export async function getProductById(id: string): Promise<ProductDetail> {
  throw new Error("getProductById: Step 3 (Catalog) not implemented yet.");
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  throw new Error("getProductBySlug: Step 3 (Catalog) not implemented yet.");
}

export async function createProduct(
  data: CreateProductPayload,
  token?: string,
): Promise<ProductDetail> {
  throw new Error("createProduct: Step 3 (Catalog) not implemented yet.");
}

export async function updateProduct(
  id: string,
  data: UpdateProductPayload,
  token?: string,
): Promise<ProductDetail> {
  throw new Error("updateProduct: Step 3 (Catalog) not implemented yet.");
}

export async function getDeletedProducts(
  token: string,
): Promise<{ success: true; data: ProductSummary[] } | { success: false; message: string }> {
  return { success: true, data: [] };
}

export async function restoreProduct(
  id: string,
  token: string,
): Promise<ProductDetail> {
  throw new Error("restoreProduct: Step 3 (Catalog) not implemented yet.");
}

export async function deleteProduct(id: string, token?: string): Promise<void> {
  throw new Error("deleteProduct: Step 3 (Catalog) not implemented yet.");
}

export async function updateStock(
  id: string,
  quantity: number,
  token?: string,
): Promise<ProductDetail> {
  throw new Error("updateStock: Step 3 (Catalog) not implemented yet.");
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  token?: string,
): Promise<void> {
  throw new Error("deleteProductImage: Step 3 (Catalog) not implemented yet.");
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<Review[]> {
  return [];
}

export async function submitReview(
  productId: string,
  data: CreateReviewPayload,
  token: string,
): Promise<Review> {
  throw new Error("submitReview: Step 6 (Reviews) not implemented yet.");
}

export async function approveReview(
  reviewId: string,
  token?: string,
): Promise<Review> {
  throw new Error("approveReview: Step 6 (Reviews) not implemented yet.");
}

export async function rejectReview(
  reviewId: string,
  token?: string,
): Promise<Review> {
  throw new Error("rejectReview: Step 6 (Reviews) not implemented yet.");
}

export async function getPendingReviews(token?: string): Promise<Review[]> {
  return [];
}

export async function getReviewsByStatus(
  status: ReviewStatus,
  token?: string,
): Promise<Review[]> {
  return [];
}