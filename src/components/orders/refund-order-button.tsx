"use client";

import { useActionState } from "react";
import { refundOrderAction, type RefundOrderState } from "@/lib/actions/refunds";

const initialState: RefundOrderState = null;

export function RefundOrderButton({ orderId }: { orderId: string }) {
  const actionWithId = refundOrderAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  // Once a refund succeeds, hide the form -- there is no partial/multiple
  // refund model on the backend (single full refund per order, enforced by
  // uq_refunds_order_id), so re-showing the button after success would just
  // invite a guaranteed 409 on the next click.
  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-completed/40 bg-status-completed/10 p-3 text-xs">
        <p className="font-medium text-status-completed">Refund issued</p>
        <p className="mt-0.5 text-muted-foreground">
          Rs {state.data?.amount.toLocaleString("en-LK")}
          {state.data?.reason ? ` — ${state.data.reason}` : ""}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Issue a full refund for this order? This can't be undone.")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-1.5"
    >
      <input
        type="text"
        name="reason"
        placeholder="Reason (optional)"
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
      />
      {state && !state.success && (
        <p className="text-xs text-status-cancelled">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10 disabled:opacity-50"
      >
        {isPending ? "Processing…" : "Issue refund"}
      </button>
    </form>
  );
}