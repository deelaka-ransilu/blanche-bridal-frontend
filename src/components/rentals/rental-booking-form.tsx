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

// yyyy-mm-dd, what <input type="date"> needs for its value/min attributes.
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function RentalBookingForm({
  productId,
  rentalPricePerDay,
  sizes,
}: {
  productId: string;
  rentalPricePerDay?: number | null;
  sizes?: string[];
}) {
  const router = useRouter();
  const boundAction = bookRentalAction.bind(null, productId);
  const [state, formAction, isPending] = useActionState<BookRentalState, FormData>(
    boundAction,
    null,
  );

  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const min = todayStr();

  useEffect(() => {
      if (state?.success && state.orderId) {
        router.push(`/my/rentals/${state.orderId}`);
      }
  }, [state, router]);

  // If the chosen start date moves past the current end date, clear the end
  // date rather than silently leaving an invalid (end < start) pair sitting
  // in the form.
  useEffect(() => {
    if (rentalEnd && rentalStart && rentalEnd < rentalStart) {
      setRentalEnd("");
    }
  }, [rentalStart, rentalEnd]);

  let estimatedTotal: number | null = null;
  if (rentalPricePerDay != null && rentalStart && rentalEnd) {
    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      estimatedTotal = days * rentalPricePerDay;
    }
  }

  const hasSizes = sizes && sizes.length > 0;
  const sizeMissing = hasSizes && !selectedSize;

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <p className="text-sm text-muted-foreground">
        This reserves the item for the dates below. Payment is cash, due when
        you pick it up — the item isn&apos;t held for you until then.
      </p>

      {hasSizes && (
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes!.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {/* Submitted as part of the form's FormData alongside the date inputs */}
          <input type="hidden" name="size" value={selectedSize ?? ""} />
          {state?.fields?.size && (
            <p className="mt-1 text-xs text-destructive">{state.fields.size}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="rentalStart" className="mb-1 block text-xs text-muted-foreground">
          Rental start date
        </label>
        <input
          id="rentalStart"
          name="rentalStart"
          type="date"
          required
          min={min}
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
          min={rentalStart || min}
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

      <Button type="submit" disabled={isPending || sizeMissing} className="w-full">
        {isPending ? "Booking..." : sizeMissing ? "Select a size to continue" : "Confirm booking"}
      </Button>
    </form>
  );
}