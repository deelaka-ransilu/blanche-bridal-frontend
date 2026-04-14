import { apiRequest } from "./client"; // your existing wrapper from Phase 1
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
} from "@/types";

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await apiRequest<Category[]>("/api/categories");
  return res.data!;
}

export async function createCategory(
  data: CreateCategoryPayload,
): Promise<Category> {
  const res = await apiRequest<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryPayload,
): Promise<Category> {
  const res = await apiRequest<Category>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest(`/api/categories/${id}`, { method: "DELETE" });
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

  // Backend returns { success, data, pagination } — return the full shape
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
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateProduct(
  id: string,
  data: UpdateProductPayload,
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/products/${id}`, { method: "DELETE" });
}

export async function updateStock(
  id: string,
  quantity: number,
): Promise<ProductDetail> {
  const res = await apiRequest<ProductDetail>(
    `/api/products/${id}/stock?quantity=${quantity}`,
    { method: "PUT" },
  );
  return res.data!;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  await apiRequest(`/api/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<Review[]> {
  const res = await apiRequest<Review[]>(`/api/products/${productId}/reviews`);
  return res.data!;
}

export async function submitReview(
  productId: string,
  data: CreateReviewPayload,
): Promise<Review> {
  const res = await apiRequest<Review>(`/api/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function approveReview(reviewId: string): Promise<Review> {
  const res = await apiRequest<Review>(`/api/reviews/${reviewId}/approve`, {
    method: "PUT",
  });
  return res.data!;
}

export async function rejectReview(reviewId: string): Promise<Review> {
  const res = await apiRequest<Review>(`/api/reviews/${reviewId}/reject`, {
    method: "PUT",
  });
  return res.data!;
}

export async function getPendingReviews(): Promise<Review[]> {
  const res = await apiRequest<Review[]>("/api/reviews/pending");
  return res.data!;
}
