"use client";

import { useActionState, useState } from "react";
import { markReturnedAction, type MarkReturnedState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

const initialState: MarkReturnedState = null;

export function MarkReturnedForm({ rentalId }: { rentalId: string }) {
  const boundAction = markReturnedAction.bind(null, rentalId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [damaged, setDamaged] = useState(false);

  if (state?.success && state.data) {
    const r = state.data;
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-status-completed/30 bg-status-completed/10 px-3 py-2 text-xs text-foreground">
        <span className="font-medium text-status-completed">Marked as returned</span>
        {r.damageCost != null && r.damageCost > 0 && (
          <span>Damage cost: Rs {r.damageCost.toLocaleString("en-LK")}</span>
        )}
        {r.lateFeeAmount != null && r.lateFeeAmount > 0 && (
          <span>Late fee: Rs {r.lateFeeAmount.toLocaleString("en-LK")}</span>
        )}
        {r.securityDepositRefundedAmount != null && (
          <span>
            Deposit refunded: Rs {r.securityDepositRefundedAmount.toLocaleString("en-LK")}
          </span>
        )}
        {r.amountOwedByCustomer != null && r.amountOwedByCustomer > 0 && (
          <span className="font-medium text-status-cancelled">
            Customer owes: Rs {r.amountOwedByCustomer.toLocaleString("en-LK")}
          </span>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {state && !state.success && (
        <p className="w-full text-xs text-destructive">{state.message}</p>
      )}
      <input
        type="date"
        name="returnDate"
        required
        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="damaged"
          checked={damaged}
          onChange={(e) => setDamaged(e.target.checked)}
        />
        Damaged
      </label>
      {damaged && (
        <input
          type="number"
          name="damageCost"
          step="0.01"
          min="0"
          placeholder="Damage cost (Rs)"
          className="w-36 rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
      )}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Mark Returned"}
      </Button>
    </form>
  );
}