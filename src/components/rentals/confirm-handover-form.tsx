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
        Handover payment created — confirm the cash payment below once it&apos;s received.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Customer has arrived to pick up the dress. Confirm handover to generate the cash
        payment for the remaining 50% + security deposit.
      </p>

      <input type="hidden" name="paymentMethod" value="CASH" />

      {state && !state.success && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Confirming…" : "Confirm handover"}
      </Button>
    </form>
  );
}