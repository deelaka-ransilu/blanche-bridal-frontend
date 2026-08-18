"use client";

import { useActionState } from "react";
import { cancelOrderAction, type CancelOrderState } from "@/lib/actions/orders/orders";

const initialState: CancelOrderState = null;

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const actionWithId = cancelOrderAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  // A request can succeed (success: true) without actually cancelling
  // anything (cancelled: false) — the order had already moved past PENDING
  // by the time this ran. That's a "didn't work" outcome from the
  // customer's point of view, so it must not render as a green success
  // message just because the API call itself didn't error. Only
  // success && cancelled is a true success; everything else (a hard
  // failure OR a successful-but-no-op request) reads as the warning style.
  const trulyCancelled = state?.success === true && state?.cancelled === true;
  const showMessage = state !== null && state.message;

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
      {showMessage && (
        <p className={`text-xs ${trulyCancelled ? "text-status-completed" : "text-status-cancelled"}`}>
          {state!.message}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || trulyCancelled}
        className="w-full rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10 disabled:opacity-50"
      >
        {isPending ? "Cancelling…" : "Cancel order"}
      </button>
    </form>
  );
}