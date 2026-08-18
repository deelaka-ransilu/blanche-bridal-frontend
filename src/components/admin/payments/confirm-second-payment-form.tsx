"use client";

import { useActionState } from "react";
import {
  confirmSecondPaymentAction,
  type ConfirmSecondPaymentState,
} from "@/lib/actions/custom-orders";
import { Button } from "@/components/ui/button";

const initialState: ConfirmSecondPaymentState = null;

export function ConfirmSecondPaymentForm({
  customDesignRequestId,
}: {
  customDesignRequestId: string;
}) {
  const boundAction = confirmSecondPaymentAction.bind(null, customDesignRequestId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-completed/30 bg-status-completed/10 px-3 py-2.5 text-xs text-status-completed">
        Final payment order created — confirm it below via the chosen method once received.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Production is ready for pickup. Choose how the customer is paying the remaining
        balance, then confirm to create the final payment order.
      </p>

      <select
        name="paymentMethod"
        defaultValue="CASH"
        className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
      >
        <option value="PAYHERE">PayHere</option>
        <option value="CASH">Cash</option>
        <option value="BANK_TRANSFER">Bank Transfer</option>
      </select>

      {state && !state.success && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Confirming…" : "Confirm final payment"}
      </Button>
    </form>
  );
}