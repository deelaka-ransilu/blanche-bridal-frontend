"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  confirmCashPaymentAction,
  type ConfirmCashPaymentState,
} from "@/lib/actions/payments";

const initialState: ConfirmCashPaymentState = null;

export function ConfirmCashPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const actionWithId = confirmCashPaymentAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-status-completed/15 px-3 py-2.5">
        <span className="text-xs font-medium text-status-completed">Cash payment confirmed</span>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Confirm that cash payment has been received for this order?")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-1.5"
    >
      {state && !state.success && (
        <p className="text-xs text-status-cancelled">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-status-completed py-2 text-xs font-medium text-white hover:bg-status-completed/90 disabled:opacity-50"
      >
        {isPending ? "Confirming…" : "Confirm cash payment"}
      </button>
    </form>
  );
}