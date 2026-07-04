"use client";

import { cancelOrderAction } from "@/lib/actions/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  return (
    <form
      action={cancelOrderAction.bind(null, orderId)}
      onSubmit={(e) => {
        if (!confirm("YOUR CUSTOM MESSAGE HERE")) {
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