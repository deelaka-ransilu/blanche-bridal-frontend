export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  reviewerName: string;
  createdAt: string;
  productId: string;
  productName: string;
};

export type ReviewStats = {
  averageRating: number | null;
  totalReviews: number;
  pendingReviews: number;
};