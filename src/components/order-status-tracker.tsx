import { Check, X, Hourglass, BadgeCheck, Scissors, PackageCheck, PartyPopper } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STEPS: { status: OrderStatus; label: string; icon: typeof Hourglass }[] = [
  { status: "PENDING", label: "Pending", icon: Hourglass },
  { status: "CONFIRMED", label: "Confirmed", icon: BadgeCheck },
  { status: "PROCESSING", label: "Processing", icon: Scissors },
  { status: "READY", label: "Ready", icon: PackageCheck },
  { status: "COMPLETED", label: "Completed", icon: PartyPopper },
];

function stepIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.status === status);
}

export function OrderStatusTracker({
  status,
  fulfillmentMethod,
  bare = false,
}: {
  status: OrderStatus;
  fulfillmentMethod?: string | null;
  // When true, skips the outer card + "Order status" heading -- for call
  // sites (e.g. the admin order detail page) that already render their own
  // enclosing card with its own heading. Without this, nesting the component
  // as-is produces a double border + duplicate "Order status" title.
  // Defaults to false so existing call sites (customer page) are unaffected.
  bare?: boolean;
}) {
  const isPickup = fulfillmentMethod?.toUpperCase() === "PICKUP";
  const readyLabel = isPickup ? "Ready for pickup" : "Ready for delivery";
  const steps = STEPS.map((s) => (s.status === "READY" ? { ...s, label: readyLabel } : s));

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    bare ? (
      <>{children}</>
    ) : (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-heading mb-4 text-sm font-medium text-foreground">Order status</p>
        {children}
      </div>
    );

  if (status === "CANCELLED") {
    return (
      <Wrapper>
        <div className="flex items-center gap-2 rounded-lg border border-status-cancelled/30 bg-status-cancelled/5 px-3 py-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-cancelled/15">
            <X className="h-3.5 w-3.5 text-status-cancelled" />
          </div>
          <span className="text-sm font-medium text-status-cancelled">
            This order has been cancelled
          </span>
        </div>
      </Wrapper>
    );
  }

  const currentIndex = stepIndex(status);
  const progressPercent =
    steps.length <= 1 ? 0 : (currentIndex / (steps.length - 1)) * 100;

  return (
    <Wrapper>
      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-0 sm:hidden">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === steps.length - 1;
          const Icon = step.icon;
          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active
                      ? "bg-primary text-white ring-4 ring-primary/15"
                      : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 transition-colors ${done ? "bg-primary/40" : "bg-border"}`}
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-medium ${
                    active || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {active && (
                  <p className="mt-0.5 text-xs text-primary">In progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal timeline with a continuous progress rail */}
      <div className="hidden sm:block">
        <div className="relative flex items-start">
          <div
            className="absolute left-0 right-0 top-4 h-px -translate-y-1/2 bg-border"
            aria-hidden
          />
          <div
            className="absolute left-0 top-4 h-px -translate-y-1/2 bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />

          {steps.map((step, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const Icon = step.icon;
            return (
              <div key={step.status} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-card transition-colors ${
                    active
                      ? "bg-primary text-white ring-4 ring-primary/15"
                      : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`max-w-[90px] text-center text-xs font-medium ${
                    active || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
}