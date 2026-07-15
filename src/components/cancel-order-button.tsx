"use client";

import { useActionState } from "react";
import { cancelOrderAction, type CancelOrderState } from "@/lib/actions/orders";

const initialState: CancelOrderState = null;

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const actionWithId = cancelOrderAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to cancel this order? This can't be undone.")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-1.5"
    >
      {state && !state.success && (
        <p className="text-xs text-status-cancelled">{state.message}</p>
      )}
      {state && state.success && (
        <p className="text-xs text-status-completed">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10 disabled:opacity-50"
      >
        {isPending ? "Cancelling…" : "Cancel order"}
      </button>
    </form>
  );
}