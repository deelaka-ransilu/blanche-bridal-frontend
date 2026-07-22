"use client";

import { useActionState, useState } from "react";
import { approveQuoteAction, rejectQuoteAction, type RespondQuoteState } from "@/lib/actions/custom-quotes";
import { Button } from "@/components/ui/button";

type Props = {
  quoteId: string;
  customDesignRequestId: string;
};

export function RespondQuoteForm({ quoteId, customDesignRequestId }: Props) {
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");

  const [approveState, approveAction, approvePending] = useActionState<RespondQuoteState, FormData>(
    approveQuoteAction.bind(null, quoteId, customDesignRequestId),
    null,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState<RespondQuoteState, FormData>(
    rejectQuoteAction.bind(null, quoteId, customDesignRequestId),
    null,
  );

  if (approveState?.success || rejectState?.success) {
    return (
      <p className="rounded-lg border border-border bg-card p-3 text-sm text-foreground">
        {approveState?.success
          ? "Quote approved — we'll be in touch about your first payment shortly."
          : "Quote rejected. We've sent your feedback to the boutique — expect a revised quote soon."}
      </p>
    );
  }

  if (mode === "idle") {
    return (
      <div className="space-y-2">
        {approveState && !approveState.success && (
          <p className="text-sm text-destructive">{approveState.message}</p>
        )}
        <div className="flex gap-3">
          <form action={approveAction}>
            <Button type="submit" disabled={approvePending}>
              {approvePending ? "Approving…" : "Approve quote"}
            </Button>
          </form>
          <Button variant="outline" type="button" onClick={() => setMode("rejecting")}>
            Reject quote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={rejectAction} className="space-y-3">
      <label className="block text-sm text-muted-foreground">
        Tell us why this quote doesn&apos;t work — we&apos;ll send a revised version.
      </label>
      <textarea
        name="reason"
        rows={3}
        required
        className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
        placeholder="e.g. The total is above my budget for this dress"
      />
      {rejectState && !rejectState.success && (
        <p className="text-sm text-destructive">{rejectState.message}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" variant="outline" disabled={rejectPending}>
          {rejectPending ? "Sending…" : "Send rejection"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setMode("idle")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}