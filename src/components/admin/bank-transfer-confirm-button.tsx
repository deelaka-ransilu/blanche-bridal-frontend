"use client";

import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { confirmBankTransferAction, type ConfirmCashPaymentState } from "@/lib/actions/payments";
import { useRefreshOnSuccess } from "@/lib/hooks/use-refresh-on-success";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const initialState: ConfirmCashPaymentState = null;

export function BankTransferConfirmButton({
  orderId,
  customDesignRequestId,
  proofImageUrl,
}: {
  orderId: string;
  customDesignRequestId?: string;
  proofImageUrl: string;
}) {
  const router = useRouter();
  const actionWithId = confirmBankTransferAction.bind(null, orderId, customDesignRequestId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useRefreshOnSuccess(state?.success, router);

  if (state?.success) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-status-completed/15 px-3 py-2.5">
        <span className="text-xs font-medium text-status-completed">Bank transfer confirmed</span>
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
    <div className="space-y-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Proof of transfer
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not a local asset */}
      <img
        src={proofImageUrl}
        alt="Bank transfer proof"
        className="max-h-64 w-full rounded-lg border border-border object-contain"
      />

      {state && !state.success && <p className="text-xs text-status-cancelled">{state.message}</p>}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="w-full rounded-lg bg-status-completed py-2 text-xs font-medium text-white hover:bg-status-completed/90 disabled:opacity-50"
      >
        {isPending ? "Confirming…" : "Confirm payment"}
      </button>

      {confirmOpen && (
        <ConfirmDialog
          icon={Landmark}
          iconWrapClass="bg-status-completed/15"
          iconClass="text-status-completed"
          confirmButtonClass="bg-status-completed hover:bg-status-completed/90"
          title="Confirm bank transfer?"
          description="Make sure you've verified the proof image against your bank statement before confirming."
          confirmLabel="Confirm payment"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doConfirm}
        />
      )}
    </div>
  );
}