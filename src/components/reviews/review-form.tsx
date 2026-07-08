"use client";

import { useActionState } from "react";
import { submitReviewAction, type SubmitReviewState } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<SubmitReviewState, FormData>(
    submitReviewAction.bind(null, productId),
    null,
  );

  if (state?.success) {
    return (
      <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium text-foreground">Leave a review</p>

      <select
        name="rating"
        required
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      >
        <option value="">Select rating…</option>
        <option value="5">★★★★★ (5)</option>
        <option value="4">★★★★☆ (4)</option>
        <option value="3">★★★☆☆ (3)</option>
        <option value="2">★★☆☆☆ (2)</option>
        <option value="1">★☆☆☆☆ (1)</option>
      </select>

      <textarea
        name="comment"
        placeholder="Share your experience (optional)"
        rows={3}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}