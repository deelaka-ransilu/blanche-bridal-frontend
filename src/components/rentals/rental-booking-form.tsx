"use client";

import { useActionState } from "react";
import { bookRentalAction, type BookRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

export function RentalBookingForm({ productId }: { productId: string }) {
  const boundAction = bookRentalAction.bind(null, productId);
  const [state, formAction, isPending] = useActionState<BookRentalState, FormData>(
    boundAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Booking received!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your rental booking has been created. Our team will contact you shortly
          to arrange payment and confirm your dates.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
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
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        {state?.fields?.rentalEnd && (
          <p className="mt-1 text-xs text-destructive">{state.fields.rentalEnd}</p>
        )}
      </div>

      <div>
        <label htmlFor="paymentMethod" className="mb-1 block text-xs text-muted-foreground">
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="PAYHERE">Pay online (PayHere)</option>
          <option value="CASH">Pay in person (Cash)</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}