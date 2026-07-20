"use client";

import { useActionState } from "react";
import { submitBankDetailsAction, type SubmitBankDetailsState } from "@/lib/actions/refunds";

const initialState: SubmitBankDetailsState = null;

export function BankDetailsForm({ orderId }: { orderId: string }) {
  const actionWithId = submitBankDetailsAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-completed/40 bg-status-completed/10 p-3 text-xs text-status-completed">
        Bank details submitted — we&apos;ll process your refund manually and email you once it&apos;s done.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <p className="text-[12px] text-muted-foreground">
        Tell us where to send your refund. We process refunds manually via bank transfer.
      </p>
      <input
        type="text"
        name="accountHolderName"
        placeholder="Account holder name"
        required
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
      />
      <input
        type="text"
        name="accountNumber"
        placeholder="Account number"
        required
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
      />
      <input
        type="text"
        name="bankName"
        placeholder="Bank name"
        required
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
      />
      <input
        type="text"
        name="branch"
        placeholder="Branch (optional)"
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
      />
      {state && !state.success && <p className="text-xs text-status-cancelled">{state.message}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit bank details"}
      </button>
    </form>
  );
}