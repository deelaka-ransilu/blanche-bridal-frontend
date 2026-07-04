"use client";

import { cancelOrderAction } from "@/lib/actions/orders";

// Thin client wrapper only for the confirm() guard -- the actual mutation
// still runs as a real Server Action (cancelOrderAction), not a client-side
// fetch. Accidental cancellation is a bad enough failure mode to warrant the
// extra JS here even though the rest of this pass avoided client components.
export function CancelOrderButton({ orderId }: { orderId: string }) {
  return (
    <form
      action={cancelOrderAction.bind(null, orderId)}
      onSubmit={(e) => {
        if (!confirm("Cancel this order? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="w-full rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10"
      >
        Cancel order
      </button>
    </form>
  );
}