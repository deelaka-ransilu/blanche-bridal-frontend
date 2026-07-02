import { Check } from "lucide-react";
import type { OrderStage } from "@/types/order";

function TrackerStage({ stage }: { stage: OrderStage }) {
  if (stage.state === "done") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-status-completed">
          <Check className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-xs text-foreground">{stage.label}</span>
      </div>
    );
  }
  if (stage.state === "active") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-status-pending" />
        <span className="text-xs font-medium text-foreground">{stage.label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-border" />
      <span className="text-xs text-muted-foreground">{stage.label}</span>
    </div>
  );
}

type ProductionStageTrackerProps = {
  stages: OrderStage[];
  role: "admin" | "employee" | "customer";
};

export function ProductionStageTracker({ stages, role }: ProductionStageTrackerProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-1 text-sm font-medium text-foreground">
        Production stage
      </p>
      <p className="mb-3.5 text-[11px] text-muted-foreground">
        {role === "admin" && "Admin view — approve or reject"}
        {role === "employee" && "Submit a proposal for the next stage"}
        {role === "customer" && "Track your order's progress"}
      </p>

      <div className={role === "customer" ? "flex flex-col gap-2.5" : "mb-3.5 flex flex-col gap-2.5"}>
        {stages.map((s) => (
          <TrackerStage key={s.label} stage={s} />
        ))}
      </div>

      {role === "admin" && (
        <div className="flex gap-2">
          <button className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Approve
          </button>
          <button className="flex-1 rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled">
            Reject
          </button>
        </div>
      )}

      {role === "employee" && (
        <button className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Submit proposal
        </button>
      )}
    </div>
  );
}