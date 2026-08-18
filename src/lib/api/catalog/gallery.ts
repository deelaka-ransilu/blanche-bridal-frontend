import { apiRequest } from "./client";
import type { GalleryImage } from "@/types/gallery";

// Public endpoint — same convention as lib/api/categories.ts: plain
// apiRequest, safe for use in Server Components during render.

export type GalleryListResult =
  | { success: true; data: GalleryImage[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export async function getAllGalleryImages(): Promise<GalleryListResult> {
  const result = await apiRequest<GalleryImage[]>("/api/gallery", { method: "GET" });
  return result as unknown as GalleryListResult;
}