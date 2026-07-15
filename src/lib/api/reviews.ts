import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";
import type { Review, ReviewStats, ReviewStatus } from "@/types/review";

// All /api/reviews/* endpoints are ADMIN-only per @PreAuthorize on
// ReviewController, and return plain Lists (no pagination wrapper) --
// same shape as MyRentalListResult in lib/api/rentals.ts.

export type ReviewListResult =
  | { success: true; data: Review[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export type ReviewStatsResult =
  | { success: true; data: ReviewStats }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Admin -- GET /api/reviews?status=X (defaults to PENDING on backend if omitted)
 */
export async function getReviewsByStatus(status: ReviewStatus): Promise<ReviewListResult> {
  const token = await getToken();
  const result = await apiRequest<Review[]>(
    `/api/reviews?status=${status}`,
    { method: "GET" },
    token,
  );
  return result as unknown as ReviewListResult;
}

/**
 * Admin -- GET /api/reviews/stats
 */
export async function getReviewStats(): Promise<ReviewStatsResult> {
  const token = await getToken();
  const result = await apiRequest<ReviewStats>(`/api/reviews/stats`, { method: "GET" }, token);
  return result as unknown as ReviewStatsResult;
}

/**
 * Public -- GET /api/products/{id}/reviews (approved only, per backend)
 */
export async function getProductReviews(productId: string): Promise<ReviewListResult> {
  const result = await apiRequest<Review[]>(
    `/api/products/${productId}/reviews`,
    { method: "GET" },
  );
  return result as unknown as ReviewListResult;
}