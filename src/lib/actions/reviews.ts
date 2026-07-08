"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Review } from "@/types/review";

export type SubmitReviewState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

// Same convention as lib/actions/rentals.ts -- void-return,
// console-log-on-failure. ReviewController's approve/reject endpoints
// both return { success, data } via Map.of(...), no envelope workaround needed.

export async function approveReviewAction(reviewId: string): Promise<void> {
  const result = await apiRequestWithRefresh<Review>(`/api/reviews/${reviewId}/approve`, {
    method: "PUT",
  });

  if (!result.success) {
    console.error(`[approveReviewAction] failed for review ${reviewId}: ${result.message}`);
  }

  revalidatePath("/admin/reviews");
}

export async function rejectReviewAction(reviewId: string): Promise<void> {
  const result = await apiRequestWithRefresh<Review>(`/api/reviews/${reviewId}/reject`, {
    method: "PUT",
  });

  if (!result.success) {
    console.error(`[rejectReviewAction] failed for review ${reviewId}: ${result.message}`);
  }

  revalidatePath("/admin/reviews");
}

export async function submitReviewAction(
  productId: string,
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const rating = formData.get("rating") as string;
  const comment = formData.get("comment") as string;

  const result = await apiRequestWithRefresh<Review>(`/api/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      rating: Number(rating),
      comment: comment || undefined,
    }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath(`/products`);
  return { success: true, message: "Review submitted — pending approval." };
}