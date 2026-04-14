"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Review, CreateReviewPayload } from "@/types";
import { submitReview } from "@/lib/api/products";
import { Button } from "@/components/ui/button";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  onReviewSubmitted?: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl leading-none transition-colors ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= (hovered || value) ? "text-amber-400" : "text-gray-200"
          }`}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-semibold shrink-0">
            {review.reviewerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.reviewerName}
            </p>
            <StarRating value={review.rating} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground shrink-0">{date}</p>
      </div>
      {review.comment && (
        <p className="mt-2.5 text-sm text-gray-600 leading-relaxed pl-11">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export function ReviewSection({
  productId,
  reviews: reviewsProp,
  onReviewSubmitted,
}: ReviewSectionProps) {
  const reviews = reviewsProp ?? [];
  const { data: session } = useSession();
  const isCustomer = session?.user?.role === "CUSTOMER";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!session?.user?.backendToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateReviewPayload = {
        rating,
        comment: comment.trim() || undefined,
      };
      await submitReview(productId, payload, session.user.backendToken);
      setSubmitted(true);
      setRating(0);
      setComment("");
      onReviewSubmitted?.();
    } catch (err: unknown) {
      // 409 = already reviewed, otherwise generic error
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setError("You have already submitted a review for this product.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-baseline gap-3 mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        {averageRating != null && (
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} · {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* Review list */}
      {reviews.length > 0 ? (
        <div className="bg-white rounded-xl border divide-y divide-gray-100 mb-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      {/* Submit form — CUSTOMER only */}
      {isCustomer && !submitted && (
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Write a review
          </p>

          {/* Star picker */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1.5">Your rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1.5">
              Your comment <span className="text-gray-400">(optional)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share your thoughts about this product..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-0.5">
              {comment.length}/500
            </p>
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      )}

      {/* Post-submit confirmation */}
      {isCustomer && submitted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ✓ Your review has been submitted and is pending approval. It will
          appear here once an admin reviews it.
        </div>
      )}

      {/* Prompt to log in */}
      {!session && (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-amber-700 underline">
            Sign in
          </a>{" "}
          as a customer to leave a review.
        </p>
      )}
    </div>
  );
}
