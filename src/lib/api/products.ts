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

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await apiRequest<Category[]>("/api/categories");
  return res.data!;
}

export async function createCategory(
  data: CreateCategoryPayload,
  token?: string,
): Promise<Category> {
  const res = await apiRequest<Category>(
    "/api/categories",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
  return res.data!;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryPayload,
  token?: string,
): Promise<Category> {
  const res = await apiRequest<Category>(
    `/api/categories/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    token,
  );
  return res.data!;
}

export async function deleteCategory(
  id: string,
  token?: string,
): Promise<void> {
  await apiRequest(`/api/categories/${id}`, { method: "DELETE" }, token);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.search) params.set("search", filters.search);
  if (filters.minPrice != null)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.available != null)
    params.set("available", String(filters.available));
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  const res = await apiRequest<ProductSummary[]>(
    `/api/products${query ? `?${query}` : ""}`,
  );

  return res as unknown as PaginatedResponse<ProductSummary>;
}

export async function getProductById(id: string): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(`/api/products/${id}`);
  return res.data!;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(`/api/products/slug/${slug}`);
  return res.data!;
}

export async function createProduct(
  data: CreateProductPayload,
  token?: string,
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(
    "/api/products",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
  return res.data!;
}

export async function updateProduct(
  id: string,
  data: UpdateProductPayload,
  token?: string,
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(
    `/api/products/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    token,
  );
  return res.data!;
}

export async function deleteProduct(id: string, token?: string): Promise<void> {
  await apiRequest(`/api/products/${id}`, { method: "DELETE" }, token);
}

export async function updateStock(
  id: string,
  quantity: number,
  token?: string,
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(
    `/api/products/${id}/stock?quantity=${quantity}`,
    { method: "PUT" },
    token,
  );
  return res.data!;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  token?: string,
): Promise<void> {
  await apiRequest(
    `/api/products/${productId}/images/${imageId}`,
    { method: "DELETE" },
    token,
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<Review[]> {
  const res = await apiRequest<Review[]>(`/api/products/${productId}/reviews`);
  return res.data!;
}

export async function submitReview(
  productId: string,
  data: CreateReviewPayload,
  token: string,
): Promise<Review> {
  const res = await apiRequest<Review>(
    `/api/products/${productId}/reviews`,
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
  return res.data!;
}

export async function approveReview(
  reviewId: string,
  token?: string,
): Promise<Review> {
  const res = await apiRequest<Review>(
    `/api/reviews/${reviewId}/approve`,
    { method: "PUT" },
    token,
  );
  return res.data!;
}

export async function rejectReview(
  reviewId: string,
  token?: string,
): Promise<Review> {
  const res = await apiRequest<Review>(
    `/api/reviews/${reviewId}/reject`,
    { method: "PUT" },
    token,
  );
  return res.data!;
}

export async function getPendingReviews(token?: string): Promise<Review[]> {
  const res = await apiRequest<Review[]>("/api/reviews/pending", {}, token);
  return res.data!;
}

export async function getReviewsByStatus(
  status: ReviewStatus,
  token?: string,
): Promise<Review[]> {
  const res = await apiRequest<Review[]>(
    `/api/reviews?status=${status}`,
    {},
    token,
  );
  return res.data!;
}
