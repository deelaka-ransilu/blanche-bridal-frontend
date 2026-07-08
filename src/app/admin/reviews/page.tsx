import { getReviewsByStatus, getReviewStats } from "@/lib/api/reviews";
import { approveReviewAction, rejectReviewAction } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import type { ReviewStatus } from "@/types/review";

const STATUS_TABS: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const activeStatus: ReviewStatus =
    statusParam && STATUS_TABS.includes(statusParam as ReviewStatus)
      ? (statusParam as ReviewStatus)
      : "PENDING";

  const [reviewsResult, statsResult] = await Promise.all([
    getReviewsByStatus(activeStatus),
    getReviewStats(),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-medium text-foreground">Reviews</h1>
        {statsResult.success && (
          <p className="text-[13px] text-muted-foreground">
            {statsResult.data.averageRating?.toFixed(1) ?? "—"} average ·{" "}
            {statsResult.data.totalReviews} total ·{" "}
            {statsResult.data.pendingReviews} pending
          </p>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/reviews?status=${tab}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              activeStatus === tab
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {!reviewsResult.success && (
        <p className="text-sm text-destructive">{reviewsResult.message}</p>
      )}

      <div className="flex flex-col gap-2.5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-card p-3.5"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {review.reviewerName} · {review.productName}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
            </div>
            <p className="mb-2 text-sm text-amber-500">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </p>
            {review.comment && (
              <p className="mb-3 text-sm text-muted-foreground">{review.comment}</p>
            )}
            {activeStatus === "PENDING" && (
              <div className="flex gap-2">
                <form action={approveReviewAction.bind(null, review.id)}>
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>
                <form action={rejectReviewAction.bind(null, review.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Reject
                  </Button>
                </form>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No {activeStatus.toLowerCase()} reviews.</p>
        )}
      </div>
    </div>
  );
}