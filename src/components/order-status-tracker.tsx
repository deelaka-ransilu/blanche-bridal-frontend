import { Check, X, Hourglass, BadgeCheck, Scissors, PackageCheck, PartyPopper } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STEPS: { status: OrderStatus; label: string; icon: typeof Hourglass; color: string }[] = [
  { status: "PENDING", label: "Pending", icon: Hourglass, color: "amber" },
  { status: "CONFIRMED", label: "Confirmed", icon: BadgeCheck, color: "sky" },
  { status: "PROCESSING", label: "Processing", icon: Scissors, color: "violet" },
  { status: "READY", label: "Ready", icon: PackageCheck, color: "orange" },
  { status: "COMPLETED", label: "Completed", icon: PartyPopper, color: "emerald" },
];

const DOT_STYLE: Record<string, { active: string; done: string }> = {
  amber: { active: "bg-amber-500 shadow-amber-500/30", done: "bg-amber-500/15 text-amber-500" },
  sky: { active: "bg-sky-500 shadow-sky-500/30", done: "bg-sky-500/15 text-sky-500" },
  violet: { active: "bg-violet-500 shadow-violet-500/30", done: "bg-violet-500/15 text-violet-500" },
  orange: { active: "bg-orange-500 shadow-orange-500/30", done: "bg-orange-500/15 text-orange-500" },
  emerald: { active: "bg-emerald-500 shadow-emerald-500/30", done: "bg-emerald-500/15 text-emerald-500" },
};

const TEXT_COLOR: Record<string, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  violet: "text-violet-500",
  orange: "text-orange-500",
  emerald: "text-emerald-500",
};

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
        <p className="font-heading mb-3 text-sm font-medium text-foreground">Order status</p>
        {children}
      </div>
    );

  if (status === "CANCELLED") {
    return (
      <Wrapper>
        <div className="flex items-center gap-2 rounded-lg bg-status-cancelled/10 px-3 py-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-cancelled/15">
            <X className="h-3 w-3 text-status-cancelled" />
          </div>
          <span className="text-[13px] font-medium text-status-cancelled">
            This order has been cancelled
          </span>
        </div>
      </Wrapper>
    );
  }

  const currentIndex = stepIndex(status);
  const progressPercent =
    steps.length <= 1 ? 0 : (currentIndex / (steps.length - 1)) * 100;
  const currentColor = steps[currentIndex].color;

  return (
    <Wrapper>
      {/* Mobile: compact horizontal stepper with labels under each dot */}
      <div className="sm:hidden">
        <div className="relative flex items-start justify-between">
          <div className="absolute left-3 right-3 top-3 h-px -translate-y-1/2 bg-border" aria-hidden />
          <div
            className={`absolute left-3 top-3 h-px -translate-y-1/2 transition-all ${DOT_STYLE[currentColor].active.split(" ")[0]}`}
            style={{ width: `calc((100% - 24px) * ${progressPercent / 100})` }}
            aria-hidden
          />
          {steps.map((step, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const Icon = step.icon;
            const dotStyle = DOT_STYLE[step.color];
            return (
              <div key={step.status} className="relative z-10 flex w-12 flex-col items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-card transition-colors ${
                    active
                      ? `${dotStyle.active} text-white shadow-[0_0_0_4px]`
                      : done
                        ? dotStyle.done
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </div>
                <span
                  className={`text-center text-[10px] font-medium leading-tight ${
                    active
                      ? TEXT_COLOR[step.color]
                      : done
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:block">
        <div className="relative flex items-start">
          <div className="absolute left-0 right-0 top-3 h-px -translate-y-1/2 bg-border" aria-hidden />
          <div
            className={`absolute left-0 top-3 h-px -translate-y-1/2 transition-all ${DOT_STYLE[currentColor].active.split(" ")[0]}`}
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />

          {steps.map((step, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const Icon = step.icon;
            const dotStyle = DOT_STYLE[step.color];
            return (
              <div key={step.status} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-card transition-colors ${
                    active
                      ? `${dotStyle.active} text-white shadow-[0_0_0_4px]`
                      : done
                        ? dotStyle.done
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </div>
                <span
                  className={`max-w-[90px] text-center text-[11px] font-medium ${
                    active
                      ? TEXT_COLOR[step.color]
                      : done
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
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