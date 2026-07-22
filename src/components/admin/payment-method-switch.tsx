"use client";

import { useActionState } from "react";
import { updatePaymentMethodAction, type UpdatePaymentMethodState } from "@/lib/actions/orders";

const initialState: UpdatePaymentMethodState = null;

export function PaymentMethodSwitch({
  orderId,
  customDesignRequestId,
  currentMethod,
}: {
  orderId: string;
  customDesignRequestId: string;
  currentMethod: string;
}) {
  const switchToCash = updatePaymentMethodAction.bind(null, orderId, customDesignRequestId, "CASH");
  const [state, formAction, isPending] = useActionState(switchToCash, initialState);

  if (currentMethod === "CASH") return null;

  return (
    <form action={formAction} className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-[12px] text-muted-foreground">
        Customer paying in person instead?
      </p>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background disabled:opacity-50"
      >
        {isPending ? "Switching…" : "Switch to cash payment"}
      </button>
      {state && !state.success && (
        <p className="mt-1.5 text-xs text-status-cancelled">{state.message}</p>
      )}
    </form>
  );
}