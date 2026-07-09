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
      <div className="rounded-lg border border-status-completed/40 bg-status-completed/10 p-3 text-xs">
        <p className="font-medium text-status-completed">Cash payment confirmed</p>
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
        className="w-full rounded-lg border border-status-completed py-2 text-xs font-medium text-status-completed hover:bg-status-completed/10 disabled:opacity-50"
      >
        {isPending ? "Confirming…" : "Confirm cash payment"}
      </button>
    </form>
  );
}