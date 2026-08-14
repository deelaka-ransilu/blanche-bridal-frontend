"use client";

import { useActionState } from "react";
import { updatePaymentMethodAction, type UpdatePaymentMethodState } from "@/lib/actions/orders";
import type { PaymentMethod } from "@/types/order";

const initialState: UpdatePaymentMethodState = null;

const TARGET_LABEL: Record<"CASH" | "PAYHERE", string> = {
  CASH: "Switch to cash payment",
  PAYHERE: "Switch to PayHere payment",
};

const TARGET_PROMPT: Record<"CASH" | "PAYHERE", string> = {
  CASH: "Customer paying in person instead?",
  PAYHERE: "Customer wants to pay via PayHere instead?",
};

type SwitchProps = {
  orderId: string;
  customDesignRequestId?: string;
  rentalId?: string;
  currentMethod: string;
  targetMethod: "CASH" | "PAYHERE";
};

export function PaymentMethodSwitch({
  orderId,
  customDesignRequestId,
  rentalId,
  currentMethod,
  targetMethod,
}: SwitchProps) {
  const doSwitch = updatePaymentMethodAction.bind(
    null,
    orderId,
    customDesignRequestId,
    rentalId,
    targetMethod as PaymentMethod,
  );
  const [state, formAction, isPending] = useActionState(doSwitch, initialState);

  // Don't show a button offering to switch to the method it's already on.
  if (currentMethod === targetMethod) return null;

  return (
    <form action={formAction} className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-[12px] text-muted-foreground">{TARGET_PROMPT[targetMethod]}</p>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background disabled:opacity-50"
      >
        {isPending ? "Switching…" : TARGET_LABEL[targetMethod]}
      </button>
      {state && !state.success && (
        <p className="mt-1.5 text-xs text-status-cancelled">{state.message}</p>
      )}
    </form>
  );
}

// ── Compact pill-toggle variant ──────────────────────────────────────────
// For headers/tight spaces (e.g. the rental detail "Next step" panel) where
// a full-width button + sentence reads as a bolted-on afterthought. Shows
// both methods as a segmented toggle; tapping the inactive one switches to
// it. Same underlying action/guardrails as the button variant above — just
// a different shell, and it renders both directions instead of one.

function PillOption({
  method,
  active,
  orderId,
  customDesignRequestId,
  rentalId,
}: {
  method: "CASH" | "PAYHERE";
  active: boolean;
  orderId: string;
  customDesignRequestId?: string;
  rentalId?: string;
}) {
  const doSwitch = updatePaymentMethodAction.bind(
    null,
    orderId,
    customDesignRequestId,
    rentalId,
    method as PaymentMethod,
  );
  const [, formAction, isPending] = useActionState(doSwitch, initialState);

  if (active) {
    return (
      <span className="rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
        {method === "CASH" ? "Cash" : "PayHere"}
      </span>
    );
  }

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        title={TARGET_LABEL[method]}
        className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {isPending ? "…" : method === "CASH" ? "Cash" : "PayHere"}
      </button>
    </form>
  );
}

export function PaymentMethodPillToggle({
  orderId,
  customDesignRequestId,
  rentalId,
  currentMethod,
}: {
  orderId: string;
  customDesignRequestId?: string;
  rentalId?: string;
  currentMethod: "CASH" | "PAYHERE";
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
      <PillOption
        method="CASH"
        active={currentMethod === "CASH"}
        orderId={orderId}
        customDesignRequestId={customDesignRequestId}
        rentalId={rentalId}
      />
      <PillOption
        method="PAYHERE"
        active={currentMethod === "PAYHERE"}
        orderId={orderId}
        customDesignRequestId={customDesignRequestId}
        rentalId={rentalId}
      />
    </div>
  );
}