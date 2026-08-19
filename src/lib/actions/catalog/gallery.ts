"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { GalleryImage } from "@/types/gallery";

export type GalleryImageInput = { url: string; publicId: string | null };

export async function createGalleryImageAction(
  input: GalleryImageInput,
  caption?: string,
): Promise<void> {
  const result = await apiRequestWithRefresh<GalleryImage>("/api/gallery", {
    method: "POST",
    body: JSON.stringify({
      url: input.url,
      publicId: input.publicId,
      caption: caption || undefined,
    }),
  });

  if (!result.success) {
    console.error(`[createGalleryImageAction] failed: ${result.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/gallery");
}

export async function updateGalleryImageAction(
  id: string,
  updates: { caption?: string; displayOrder?: number },
): Promise<void> {
  const result = await apiRequestWithRefresh<GalleryImage>(`/api/gallery/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  if (!result.success) {
    console.error(`[updateGalleryImageAction] failed for ${id}: ${result.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/gallery");
}

export async function deleteGalleryImageAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<string>(`/api/gallery/${id}`, {
    method: "DELETE",
  });

  if (!result.success) {
    console.error(`[deleteGalleryImageAction] failed for ${id}: ${result.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/gallery");
}