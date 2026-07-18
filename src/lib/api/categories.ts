import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";
import type { Category, CategoryType } from "@/types/category";

export type CategoryListResult =
  | { success: true; data: Category[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

// Public endpoint, but reads happen in Server Components, so keep the
// consistent apiRequest (not apiRequestWithRefresh) convention regardless.
// Pass `type` to fetch only DRESS or only ACCESSORY categories (used by
// Rentals and Catalog respectively); omit to get everything.
export async function getAllCategories(type?: CategoryType): Promise<CategoryListResult> {
  const path = type ? `/api/categories?type=${type}` : "/api/categories";
  const result = await apiRequest<Category[]>(path, { method: "GET" });
  return result as unknown as CategoryListResult;
}

export async function getDeletedCategories(): Promise<CategoryListResult> {
  const token = await getToken();
  const result = await apiRequest<Category[]>(
    "/api/categories/deleted",
    { method: "GET" },
    token,
  );
  return result as unknown as CategoryListResult;
}