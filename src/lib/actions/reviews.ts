"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Review } from "@/types/review";

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