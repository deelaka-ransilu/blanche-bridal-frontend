"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import type { ProductionActionState } from "@/lib/actions/production";

const initialState: ProductionActionState = null;

export function ApproveRejectProductionForm({
  approveAction,
  rejectAction,
}: {
  // Both bound with orderId + customDesignRequestId already applied at the
  // call site — same pattern as ProductionStepperForm / StartProductionForm.
  approveAction: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
  rejectAction: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
}) {
  // Two independent forms, two independent pieces of state — approving and
  // rejecting are mutually exclusive actions on the same pending proposal,
  // so there's no need to share state between them; whichever one the
  // admin actually submits is the one whose result should show.
  const [approveState, approveFormAction, approvePending] = useActionState(approveAction, initialState);
  const [rejectState, rejectFormAction, rejectPending] = useActionState(rejectAction, initialState);

  const busy = approvePending || rejectPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <form action={approveFormAction}>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {approvePending ? "Approving…" : "Approve"}
          </button>
        </form>
        <form action={rejectFormAction} className="flex items-center gap-2">
          <input
            type="text"
            name="notes"
            placeholder="Rejection reason (optional)"
            disabled={busy}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-status-cancelled px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {rejectPending ? "Rejecting…" : "Reject"}
          </button>
        </form>
      </div>

      {approveState && !approveState.success && (
        <p className="flex items-center gap-1.5 text-[11px] text-status-cancelled">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {approveState.message || "Could not approve. Try again."}
        </p>
      )}
      {rejectState && !rejectState.success && (
        <p className="flex items-center gap-1.5 text-[11px] text-status-cancelled">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {rejectState.message || "Could not reject. Try again."}
        </p>
      )}
    </div>
  );
}