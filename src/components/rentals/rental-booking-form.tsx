"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookRentalAction, type BookRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RentalBookingForm({
  productId,
  rentalPricePerDay,
}: {
  productId: string;
  rentalPricePerDay?: number | null;
}) {
  const router = useRouter();
  const boundAction = bookRentalAction.bind(null, productId);
  const [state, formAction, isPending] = useActionState<BookRentalState, FormData>(
    boundAction,
    null,
  );

  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");

  useEffect(() => {
    if (state?.success && state.orderId) {
      router.push(`/my/orders/${state.orderId}`);
    }
  }, [state, router]);

  let estimatedTotal: number | null = null;
  if (rentalPricePerDay != null && rentalStart && rentalEnd) {
    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      estimatedTotal = days * rentalPricePerDay;
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <p className="text-sm text-muted-foreground">
        This reserves the item for the dates below. Payment is cash, due when
        you pick it up — the item isn&apos;t held for you until then.
      </p>

      <div>
        <label htmlFor="rentalStart" className="mb-1 block text-xs text-muted-foreground">
          Rental start date
        </label>
        <input
          id="rentalStart"
          name="rentalStart"
          type="date"
          required
          value={rentalStart}
          onChange={(e) => setRentalStart(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        {state?.fields?.rentalStart && (
          <p className="mt-1 text-xs text-destructive">{state.fields.rentalStart}</p>
        )}
      </div>

      <div>
        <label htmlFor="rentalEnd" className="mb-1 block text-xs text-muted-foreground">
          Rental end date
        </label>
        <input
          id="rentalEnd"
          name="rentalEnd"
          type="date"
          required
          value={rentalEnd}
          onChange={(e) => setRentalEnd(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        {state?.fields?.rentalEnd && (
          <p className="mt-1 text-xs text-destructive">{state.fields.rentalEnd}</p>
        )}
      </div>

      {estimatedTotal != null && (
        <div className="rounded-lg bg-primary/8 px-3 py-2">
          <p className="text-sm text-foreground">
            Estimated total: <span className="font-medium">{formatPrice(estimatedTotal)}</span>
          </p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}