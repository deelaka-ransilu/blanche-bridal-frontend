"use client";

import { useRef, useState } from "react";
import { AlertCircle, Circle, CheckCircle2, PackageCheck, Wrench, XCircle, Lock } from "lucide-react";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/order";

const STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  icon: React.ElementType;
  // Tailwind classes for the ACTIVE (selected) state per status.
  activeClass: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
    icon: AlertCircle,
    activeClass: "bg-amber-500/15 text-amber-500 border-amber-500/40",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    icon: Circle,
    activeClass: "bg-blue-500/15 text-blue-400 border-blue-500/40",
  },
  {
    value: "PROCESSING",
    label: "Processing",
    icon: Wrench,
    // Brand rose-mauve instead of a generic purple, ties this step to the
    // site accent rather than looking like an arbitrary status library color.
    activeClass: "bg-primary/15 text-primary border-primary/40",
  },
  {
    value: "READY",
    label: "Ready",
    icon: PackageCheck,
    activeClass: "bg-teal-500/15 text-teal-400 border-teal-500/40",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
    activeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  },
];

const CANCELLED = {
  value: "CANCELLED" as OrderStatus,
  label: "Cancelled",
  icon: XCircle,
  activeClass: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/40",
};

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const action = updateOrderStatusAction.bind(null, orderId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelSubmitRef = useRef<HTMLButtonElement>(null);

  // Once an order is CANCELLED or COMPLETED, nothing about its status
  // changes again — every button in this form becomes inert. Mirrors the
  // backend guard in OrderServiceImpl.updateOrderStatus (isTerminal check),
  // so a disabled button here always matches what the API would actually
  // allow, not just a UI-only restriction.
  const isLocked = currentStatus === "CANCELLED" || currentStatus === "COMPLETED";

  // NOTE: same tech debt as lib/actions/production.ts — this is bound
  // directly to <form action>, so a server-side failure just doesn't update
  // the UI after revalidatePath, with no visible error. Fast-follow: convert
  // to a client component using useActionState once refund-order-button's
  // pattern is ready to reuse here.
  return (
    <>
      <form action={action} className="flex flex-wrap items-center gap-1.5">
        {STATUS_OPTIONS.map((s) => {
          const isActive = s.value === currentStatus;
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              type="submit"
              name="status"
              value={s.value}
              disabled={isActive || isLocked}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? `${s.activeClass} cursor-default`
                  : isLocked
                    ? "cursor-not-allowed border-border bg-background text-muted-foreground/40"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}

        {/* Visually separated — cancellation is a side-branch (restores stock),
            not a forward step, so it doesn't belong in the same visual row
            as the progress pills. */}
        <span className="mx-1 h-4 w-px bg-border" />

        {/* Hidden real submit button — this is what actually fires the
            server action once the custom dialog is confirmed. Kept inside
            the same <form> so nothing about the action wiring changes. */}
        <button
          ref={cancelSubmitRef}
          type="submit"
          name="status"
          value={CANCELLED.value}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          disabled={isLocked}
          onClick={() => setConfirmOpen(true)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            currentStatus === "CANCELLED"
              ? `${CANCELLED.activeClass} cursor-default`
              : isLocked
                ? "cursor-not-allowed border-border bg-background text-muted-foreground/40"
                : "border-border bg-background text-muted-foreground hover:border-status-cancelled/40 hover:text-status-cancelled"
          }`}
        >
          <CANCELLED.icon className="h-3.5 w-3.5" />
          {CANCELLED.label}
        </button>
      </form>

      {isLocked && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          {currentStatus === "CANCELLED"
            ? "This order is cancelled — status can't be changed further."
            : "This order is completed — status can't be changed further."}
        </p>
      )}

      {/* Guarded by !isLocked as well as confirmOpen — belt-and-braces so
          the dialog can never be reached on a locked order even if
          confirmOpen were somehow set true (e.g. leftover state from a
          status change that just landed while the dialog was open). */}
      {confirmOpen && !isLocked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-cancelled/15">
                <XCircle className="h-4 w-4 text-status-cancelled" />
              </div>
              <div>
                <p id="cancel-order-title" className="text-sm font-medium text-foreground">
                  Cancel this order?
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  This restores reserved stock and can&apos;t be undone here.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  cancelSubmitRef.current?.click();
                }}
                className="rounded-lg bg-status-cancelled px-3 py-1.5 text-xs font-medium text-white hover:bg-status-cancelled/90"
              >
                Cancel order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}