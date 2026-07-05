"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Category } from "@/types/category";

export type CategoryFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = formData.get("parentId") as string;

  const result = await apiRequestWithRefresh<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name, slug, parentId: parentId || undefined }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/categories");
  return { success: true, message: "Category created." };
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = formData.get("parentId") as string;

  const result = await apiRequestWithRefresh<Category>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: name || undefined,
      slug: slug || undefined,
      parentId: parentId || undefined,
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/categories");
  return { success: true, message: "Category updated." };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<string>(`/api/categories/${id}`, {
    method: "DELETE",
  });
  if (!result.success) {
    console.error(`[deleteCategoryAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/categories");
}

export async function restoreCategoryAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<Category>(`/api/categories/${id}/restore`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[restoreCategoryAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/categories");
}