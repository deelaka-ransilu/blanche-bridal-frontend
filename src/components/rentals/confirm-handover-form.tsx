"use client";

import { useActionState } from "react";
import { confirmHandoverAction, type ConfirmHandoverState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

const initialState: ConfirmHandoverState = null;

export function ConfirmHandoverForm({ rentalId }: { rentalId: string }) {
  const boundAction = confirmHandoverAction.bind(null, rentalId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-completed/30 bg-status-completed/10 px-3 py-2.5 text-xs text-status-completed">
        Handover payment order created — confirm it below once cash is received.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Confirm the dress is being handed over to the customer, and choose how the
        remaining 50% + security deposit is being paid.
      </p>

      <select
        name="paymentMethod"
        defaultValue="CASH"
        style={{ colorScheme: "dark" }}
        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
      >
        <option value="CASH" className="bg-background text-foreground">Cash</option>
        <option value="PAYHERE" className="bg-background text-foreground">PayHere</option>
      </select>

      {state && !state.success && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Confirming…" : "Confirm handover"}
      </Button>
    </form>
  );
}