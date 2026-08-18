"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import type { ProductionActionState } from "@/lib/actions/production";

const initialState: ProductionActionState = null;

export function StartProductionForm({
  action,
}: {
  // Bound with orderId + customDesignRequestId already applied at the call
  // site — same pattern as ProductionStepperForm.
  action: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Starting…" : "Start Production"}
      </button>

      {state && !state.success && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-status-cancelled">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {state.message || "Could not start production. Try again."}
        </p>
      )}
    </form>
  );
}