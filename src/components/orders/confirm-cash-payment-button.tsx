"use client";

import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import {
  confirmCashPaymentAction,
  type ConfirmCashPaymentState,
} from "@/lib/actions/payments";
import { useRefreshOnSuccess } from "@/lib/hooks/use-refresh-on-success";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const initialState: ConfirmCashPaymentState = null;

export function ConfirmCashPaymentButton({
  orderId,
  customDesignRequestId,
  amountLabel,
}: {
  orderId: string;
  customDesignRequestId?: string;
  amountLabel?: string;
}) {
  const router = useRouter();
  const actionWithId = confirmCashPaymentAction.bind(null, orderId, customDesignRequestId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useRefreshOnSuccess(state?.success, router);

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
        <ConfirmDialog
          icon={BadgeCheck}
          iconWrapClass="bg-status-completed/15"
          iconClass="text-status-completed"
          confirmButtonClass="bg-status-completed hover:bg-status-completed/90"
          title="Confirm cash payment?"
          description={
            <>
              {amountLabel
                ? `This confirms ${amountLabel} was received in cash for this order.`
                : "This confirms cash has been received for this order."}{" "}
              Make sure the money is actually in hand before confirming.
            </>
          }
          confirmLabel="Confirm payment"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doConfirm}
        />
      )}
    </>
  );
}