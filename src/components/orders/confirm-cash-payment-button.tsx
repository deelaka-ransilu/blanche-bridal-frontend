"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import {
  confirmCashPaymentAction,
  type ConfirmCashPaymentState,
} from "@/lib/actions/payments";

const initialState: ConfirmCashPaymentState = null;

export function ConfirmCashPaymentButton({
  orderId,
  amountLabel,
}: {
  orderId: string;
  amountLabel?: string;
}) {
  const router = useRouter();
  const actionWithId = confirmCashPaymentAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  function doConfirm() {
    setConfirmOpen(false);
    startTransition(() => {
      formAction(new FormData());
    });
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {state && !state.success && (
          <p className="text-xs text-status-cancelled">{state.message}</p>
        )}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          className="w-full rounded-lg bg-status-completed py-2 text-xs font-medium text-white hover:bg-status-completed/90 disabled:opacity-50"
        >
          {isPending ? "Confirming…" : "Confirm cash payment"}
        </button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-cash-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-completed/15">
                <BadgeCheck className="h-4 w-4 text-status-completed" />
              </div>
              <div>
                <p id="confirm-cash-title" className="text-sm font-medium text-foreground">
                  Confirm cash payment?
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {amountLabel
                    ? `This confirms ${amountLabel} was received in cash for this order.`
                    : "This confirms cash has been received for this order."}{" "}
                  Make sure the money is actually in hand before confirming.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={doConfirm}
                className="rounded-lg bg-status-completed px-3 py-1.5 text-xs font-medium text-white hover:bg-status-completed/90"
              >
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}