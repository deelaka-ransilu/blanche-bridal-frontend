import { apiRequest, type ApiResponse } from "./client";
import type {
  ProductSummary,
  ProductDetail,
  Category,
  Paginated,
} from "@/types/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ProductListParams {
  type?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Public product list — has custom {success, data, pagination} shape,
// so we bypass parseResponse's ApiResponse<T> union and read raw JSON.
export async function listProducts(
  params: ProductListParams = {},
): Promise<Paginated<ProductSummary> | { error: string }> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });

  const res = await fetch(`${API_URL}/api/products?${qs.toString()}`, {
    cache: "no-store",
  });
  const json = await res.json();

  if (!json.success) {
    return { error: json.message ?? "Failed to load products" };
  }
  return { data: json.data, pagination: json.pagination };
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<ProductDetail>> {
  return apiRequest<ProductDetail>(`/api/products/slug/${slug}`);
}

export async function listCategories(): Promise<ApiResponse<Category[]>> {
  return apiRequest<Category[]>("/api/categories");
}