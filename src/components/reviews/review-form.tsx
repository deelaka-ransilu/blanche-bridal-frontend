"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction, type SubmitReviewState } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<SubmitReviewState, FormData>(
    submitReviewAction.bind(null, productId),
    null,
  );
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (state?.success) {
    return (
      <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-border bg-primary/5 p-4"
    >
      <p className="text-sm font-medium text-foreground">Leave a review</p>

      <input type="hidden" name="rating" value={rating || ""} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                n <= (hovered || rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">{rating} / 5</span>
        )}
      </div>

      <textarea
        name="comment"
        placeholder="Share your experience (optional)"
        rows={3}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="sm" disabled={pending || rating === 0}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}