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

export async function ReviewsView({ status }: { status?: string }) {
  const activeStatus: ReviewStatus =
    status && STATUS_TABS.includes(status as ReviewStatus)
      ? (status as ReviewStatus)
      : "PENDING";

  const [reviewsResult, statsResult] = await Promise.all([
    getReviewsByStatus(activeStatus),
    getReviewStats(),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];

  return (
    <div>
      {statsResult.success && (
        <p className="mb-3.5 text-[13px] text-muted-foreground">
          {statsResult.data.averageRating?.toFixed(1) ?? "—"} average ·{" "}
          {statsResult.data.totalReviews} total ·{" "}
          {statsResult.data.pendingReviews} pending
        </p>
      )}

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/bookings?tab=reviews&reviewStatus=${tab}`}
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
          <div key={review.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {review.reviewerName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">{review.productName}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <p className="text-sm text-amber-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <span className="text-xs text-muted-foreground">{review.rating}.0</span>
            </div>

            {review.comment && (
              <p className="mt-2 rounded-xl border border-border bg-background/40 p-3 text-sm italic text-muted-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}

            {activeStatus === "PENDING" && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
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