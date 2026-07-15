"use client";

import { AlertCircle, Circle, CheckCircle2, PackageCheck, Wrench, XCircle } from "lucide-react";
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

  // NOTE: same tech debt as lib/actions/production.ts — this is bound
  // directly to <form action>, so a server-side failure just doesn't update
  // the UI after revalidatePath, with no visible error. Fast-follow: convert
  // to a client component using useActionState once refund-order-button's
  // pattern is ready to reuse here.
  return (
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
            disabled={isActive}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? `${s.activeClass} cursor-default`
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

      <button
        type="submit"
        name="status"
        value={CANCELLED.value}
        disabled={currentStatus === "CANCELLED"}
        onClick={(e) => {
          if (
            currentStatus !== "CANCELLED" &&
            !confirm("Cancel this order? This restores reserved stock and can't be undone here.")
          ) {
            e.preventDefault();
          }
        }}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          currentStatus === "CANCELLED"
            ? `${CANCELLED.activeClass} cursor-default`
            : "border-border bg-background text-muted-foreground hover:border-status-cancelled/40 hover:text-status-cancelled"
        }`}
      >
        <CANCELLED.icon className="h-3.5 w-3.5" />
        {CANCELLED.label}
      </button>
    </form>
  );
}