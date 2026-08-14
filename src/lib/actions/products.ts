"use server";

import { apiRequestWithRefresh } from "@/lib/api/server";
import {
  getUploadSignature as getUploadSignatureRead,
  getAvailableProducts as getAvailableProductsRead,
} from "@/lib/api/products";
import { revalidatePath } from "next/cache";
import type { ProductDetail } from "@/types/product";

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
  const dressValue = formData.get("dressValue") as string;

  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    categoryId: categoryId,
    rentalPrice: rentalPrice ? Number(rentalPrice) : null,
    purchasePrice: purchasePrice ? Number(purchasePrice) : null,
    dressValue: dressValue ? Number(dressValue) : null,
    stock: Number(formData.get("stock") || 0),
    sizes,
    images,
  };
}

async function saveProduct(
  path: string,
  method: "POST" | "PUT",
  formData: FormData,
): Promise<ProductFormState> {
  const payload = buildPayload(formData);

  const result = await apiRequestWithRefresh(path, {
    method,
    body: JSON.stringify(payload),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  return saveProduct("/api/products", "POST", formData);
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  return saveProduct(`/api/products/${id}`, "PUT", formData);
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
export async function getUploadSignatureAction(context: string = "product") {
  return getUploadSignatureRead(context);
}

/** Server Action wrapper so client components (walk-in sale panel's Order
 * step) can fetch the rentable/purchasable product list without importing
 * lib/api/products.ts directly — same rationale as getUploadSignatureAction
 * above. `available=true` filtering happens inside getAvailableProducts. */
export async function getAvailableProductsAction() {
  return getAvailableProductsRead();
}

/** Server Action wrapper so RentalsPanel (client component) can fetch full
 * ProductDetail (including sizes, description, images) when opening the
 * edit form — the list-view Product type doesn't carry enough detail to
 * prefill an edit form.
 *
 * Calls apiRequestWithRefresh directly (NOT lib/api/products.ts's
 * getProductById) because this runs as a genuine Server Action — unlike the
 * Server Component call site in admin/products/[id]/page.tsx, it's safe
 * here to retry with a refreshed token, since Next.js allows cookie writes
 * in Server Actions but not during Server Component render. Fixes
 * "Token expired" errors when opening the Rentals edit form with a stale
 * session (RentalsPanel.openEdit). */
export async function getProductByIdAction(id: string) {
  return apiRequestWithRefresh<ProductDetail>(`/api/products/${id}`, { method: "GET" });
}

/** Server Action wrapper so ImageUploader (client component) can delete a
 * single already-saved product image immediately on click, rather than
 * deferring to form save — calls the existing admin-only
 * DELETE /api/products/{id}/images/{imageId} endpoint. */
export async function deleteProductImageAction(productId: string, imageId: string) {
  const result = await apiRequestWithRefresh(`/api/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });

  if (result.success) {
    revalidatePath("/admin/products");
  }

  return result;
}