import { Check, Clock } from "lucide-react";
import {
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STAGE_ORDER,
  type ProductionStageRecord,
} from "@/types/production";
import {
  approveProductionAction,
  rejectProductionAction,
  proposeStageAction,
} from "@/lib/actions/production";

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
  orderId: string;
};

export function ProductionStageTracker({ record, role, orderId }: ProductionStageTrackerProps) {
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

  const approveAction = approveProductionAction.bind(null, orderId);
  const rejectAction = rejectProductionAction.bind(null, orderId);
  const proposeAction = proposeStageAction.bind(null, orderId);

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

      {role === "admin" && hasPendingProposal && (
        <div className="flex flex-col gap-2">
          <form action={approveAction}>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Approve
            </button>
          </form>
          {/* Native <details> gives a no-JS accordion for the optional
              rejection note, avoiding a client component just for toggle state. */}
          <details className="rounded-lg border border-status-cancelled">
            <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-status-cancelled">
              Reject
            </summary>
            <form action={rejectAction} className="flex flex-col gap-2 p-3 pt-0">
              <textarea
                name="notes"
                placeholder="Reason (optional)"
                rows={2}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground"
              />
              <button
                type="submit"
                className="rounded-lg border border-status-cancelled py-1.5 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10"
              >
                Confirm rejection
              </button>
            </form>
          </details>
        </div>
      )}

      {role === "employee" && !hasPendingProposal && (
        <details className="rounded-lg border border-border">
          <summary className="cursor-pointer px-3 py-2 text-center text-xs font-medium text-primary">
            Submit proposal
          </summary>
          <form action={proposeAction} className="flex flex-col gap-2 p-3 pt-0">
            <select
              name="pendingStage"
              defaultValue={record.currentStage}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              {PRODUCTION_STAGE_ORDER.map((stage) => (
                <option key={stage} value={stage}>
                  {PRODUCTION_STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
            <textarea
              name="notes"
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Submit proposal
            </button>
          </form>
        </details>
      )}
    </div>
  );
}