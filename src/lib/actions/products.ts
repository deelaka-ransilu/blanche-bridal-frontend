"use server";

import { apiRequestWithRefresh } from "@/lib/api/server";
import { getUploadSignature as getUploadSignatureRead } from "@/lib/api/products";
import { revalidatePath } from "next/cache";

export type ProductFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export type ProductImageInput = { url: string; publicId: string | null };

function buildPayload(formData: FormData) {
  const sizes = formData.getAll("sizes").map((s) => String(s));

  const imagesRaw = formData.get("images") as string; // JSON-stringified ProductImageInput[]
  const images: ProductImageInput[] = imagesRaw ? JSON.parse(imagesRaw) : [];

  const categoryId = formData.get("categoryId") as string;
  const rentalPrice = formData.get("rentalPrice") as string;
  const purchasePrice = formData.get("purchasePrice") as string;

  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    type: formData.get("type") as string,
    categoryId: categoryId || null,
    rentalPrice: rentalPrice ? Number(rentalPrice) : null,
    purchasePrice: purchasePrice ? Number(purchasePrice) : null,
    stock: Number(formData.get("stock") || 0),
    sizes,
    images,
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const payload = buildPayload(formData);

  const result = await apiRequestWithRefresh(
    "/api/products",
    { method: "POST", body: JSON.stringify(payload) },
  );

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const payload = buildPayload(formData);

  const result = await apiRequestWithRefresh(
    `/api/products/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<void> {
  await apiRequestWithRefresh(`/api/products/${id}`, { method: "DELETE" });
  revalidatePath("/admin/products");
}

export async function restoreProductAction(id: string): Promise<void> {
  await apiRequestWithRefresh(`/api/products/${id}/restore`, { method: "PUT" });
  revalidatePath("/admin/products");
}

/** Server Action wrapper so client components (ImageUploader) can call this
 * without directly importing lib/api/products.ts's server-only session logic
 * (that file imports lib/auth.ts, which uses next/headers — server-only). */
export async function getUploadSignatureAction() {
  return getUploadSignatureRead();
}