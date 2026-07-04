import { Check, Clock } from "lucide-react";
import {
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STAGE_ORDER,
  type ProductionStageRecord,
} from "@/types/production";

type VisualState = "done" | "active" | "pending-approval" | "pending";

function TrackerStage({ label, state }: { label: string; state: VisualState }) {
  if (state === "done") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-status-completed">
          <Check className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-xs text-foreground">{label}</span>
      </div>
    );
  }
  if (state === "pending-approval") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-status-pending bg-status-pending/10">
          <Clock className="h-2.5 w-2.5 text-status-pending" />
        </div>
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="rounded-full bg-status-pending/15 px-1.5 py-0.5 text-[10px] font-medium text-status-pending">
          Pending approval
        </span>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-status-pending" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

type ProductionStageTrackerProps = {
  record: ProductionStageRecord;
  role: "admin" | "employee" | "customer";
};

export function ProductionStageTracker({ record, role }: ProductionStageTrackerProps) {
  const currentIndex = PRODUCTION_STAGE_ORDER.indexOf(record.currentStage);
  const hasPendingProposal = record.status === "PENDING_APPROVAL" && record.pendingStage !== null;

  const rows = PRODUCTION_STAGE_ORDER.map((stage, i) => {
    let state: VisualState;
    if (i < currentIndex) {
      state = "done";
    } else if (i === currentIndex) {
      state = hasPendingProposal ? "pending-approval" : "active";
    } else {
      state = "pending";
    }
    return { stage, label: PRODUCTION_STAGE_LABELS[stage], state };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-1 text-sm font-medium text-foreground">
        Production stage
      </p>
      <p className="mb-3.5 text-[11px] text-muted-foreground">
        {role === "admin" &&
          (hasPendingProposal ? "A stage change is awaiting your approval" : "Admin view")}
        {role === "employee" && "Submit a proposal for the next stage"}
        {role === "customer" && "Track your order's progress"}
      </p>

      <div className={role === "customer" ? "flex flex-col gap-2.5" : "mb-3.5 flex flex-col gap-2.5"}>
        {rows.map((r) => (
          <TrackerStage key={r.stage} label={r.label} state={r.state} />
        ))}
      </div>

      {/* Actions intentionally inert this pass — display-only wiring.
          Mutations (approve/reject/propose) are a separate follow-up session,
          see CURRENT_STATE.md. */}
      {role === "admin" && hasPendingProposal && (
        <div className="flex gap-2">
          <button
            disabled
            title="Coming in a follow-up pass"
            className="flex-1 cursor-not-allowed rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground opacity-50"
          >
            Approve
          </button>
          <button
            disabled
            title="Coming in a follow-up pass"
            className="flex-1 cursor-not-allowed rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {role === "employee" && !hasPendingProposal && (
        <button
          disabled
          title="Coming in a follow-up pass"
          className="w-full cursor-not-allowed rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground opacity-50"
        >
          Submit proposal
        </button>
      )}
    </div>
  );
}