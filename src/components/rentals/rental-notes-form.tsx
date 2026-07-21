"use client";

import { useActionState, useEffect, useState } from "react";
import { updateRentalNotesAction, type UpdateRentalNotesState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

const initialState: UpdateRentalNotesState = null;

export function RentalNotesForm({
  rentalId,
  initialNotes,
}: {
  rentalId: string;
  initialNotes: string | null;
}) {
  const boundAction = updateRentalNotesAction.bind(null, rentalId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (state?.success) setDirty(false);
  }, [state]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Fitting / alteration notes
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-2">
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setDirty(true);
          }}
          placeholder="e.g. take in waist 1&quot;, hem 2&quot; shorter, needs new lace trim at bust…"
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />

        {state && !state.success && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-end gap-2">
          {state?.success && !dirty && (
            <span className="text-xs text-status-completed">Saved</span>
          )}
          <Button type="submit" size="sm" disabled={isPending || !dirty}>
            {isPending ? "Saving…" : "Save notes"}
          </Button>
        </div>
      </form>
    </div>
  );
}