import { Check, X } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "READY", label: "Ready" },
  { status: "COMPLETED", label: "Completed" },
];

function stepIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.status === status);
}

export function OrderStatusTracker({
  status,
  fulfillmentMethod,
}: {
  status: OrderStatus;
  fulfillmentMethod?: string | null;
}) {
  const isPickup = fulfillmentMethod?.toUpperCase() === "PICKUP";
  const readyLabel = isPickup ? "Ready for pickup" : "Ready for delivery";
  const steps = STEPS.map((s) => (s.status === "READY" ? { ...s, label: readyLabel } : s));

  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-heading mb-3 text-sm font-medium text-foreground">Order status</p>
        <div className="flex items-center gap-2 rounded-lg border border-status-cancelled/30 bg-status-cancelled/5 px-3 py-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-cancelled/15">
            <X className="h-3.5 w-3.5 text-status-cancelled" />
          </div>
          <span className="text-sm font-medium text-status-cancelled">
            This order has been cancelled
          </span>
        </div>
      </div>
    );
  }

  const currentIndex = stepIndex(status);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-4 text-sm font-medium text-foreground">Order status</p>

      {/* Mobile: vertical list. sm+: horizontal steps. */}
      <div className="flex flex-col gap-0 sm:hidden">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-primary text-white"
                      : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {!isLast && (
                  <div className={`w-px flex-1 ${done ? "bg-primary/40" : "bg-border"}`} style={{ minHeight: 20 }} />
                )}
              </div>
              <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-medium ${
                    active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden items-start sm:flex">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.status} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-primary text-white"
                      : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`max-w-[80px] text-center text-xs font-medium ${
                    active || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`mx-2 h-px flex-1 ${done ? "bg-primary/40" : "bg-border"}`} style={{ marginBottom: 24 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}