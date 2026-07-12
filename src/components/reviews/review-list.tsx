import type { Review } from "@/types/review";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {average.toFixed(1)} average · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </p>
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                {review.reviewerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-1 items-center justify-between">
                <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <p className="mb-1 text-sm text-primary">
              {"★".repeat(review.rating)}
              <span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span>
            </p>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}