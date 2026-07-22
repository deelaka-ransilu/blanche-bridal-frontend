import { Check, Clock } from "lucide-react";
import {
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STAGE_ORDER,
  EMPLOYEE_PROPOSABLE_STAGES,
  type ProductionStageRecord,
} from "@/types/production";
import {
  approveProductionAction,
  rejectProductionAction,
  proposeStageAction,
} from "@/lib/actions/production";
import { AssignEmployeeForm } from "@/components/assign-employee-form";

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
  customDesignRequestId: string;
  orderStatus?: "PENDING" | "CONFIRMED" | "PROCESSING" | "READY" | "COMPLETED" | "CANCELLED";
};

export function ProductionStageTracker({
  record,
  role,
  orderId,
  customDesignRequestId,
  orderStatus,
}: ProductionStageTrackerProps) {
  const currentIndex = PRODUCTION_STAGE_ORDER.indexOf(record.currentStage);
  const hasPendingProposal = record.status === "PENDING_APPROVAL" && record.pendingStage !== null;
  const isTerminal = orderStatus === "COMPLETED" || orderStatus === "CANCELLED";

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

  // approve/reject now revalidate the custom-orders detail page, so both
  // need orderId (which endpoint to hit) and customDesignRequestId (which
  // page to revalidate). proposeStageAction is unchanged -- it still only
  // takes (orderId, formData) and revalidates the employee order page.
  const approveAction = approveProductionAction.bind(null, orderId, customDesignRequestId);
  const rejectAction = rejectProductionAction.bind(null, orderId, customDesignRequestId);
  const proposeAction = proposeStageAction.bind(null, orderId);

  // Employee can only ever propose one of the two mid-pipeline stages.
  // Default the select to whichever of those two comes right after the
  // current stage, so a mid-flow employee sees the sensible next step
  // preselected instead of always landing on the first option.
  const nextProposableDefault =
    EMPLOYEE_PROPOSABLE_STAGES.find(
      (stage) => PRODUCTION_STAGE_ORDER.indexOf(stage) >= currentIndex
    ) ?? EMPLOYEE_PROPOSABLE_STAGES[0];

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

      {isTerminal && role !== "customer" && (
        <div className="mb-3 rounded-lg border border-border bg-muted/30 p-2.5">
          <p className="text-[11px] text-muted-foreground">
            This order is {orderStatus === "CANCELLED" ? "cancelled" : "completed"} —
            production actions are no longer available.
          </p>
        </div>
      )}

      {/* Latest note panel. `notes` on the record is a single field that gets
          overwritten on every propose/approve/reject call (see
          types/production.ts) -- there's no history, so this shows only the
          most recent note, not a log. We don't have name resolution for
          proposedById/reviewedById (flat IDs only, per that file's header
          comment), so labels are generic: from this viewer's own `role`, we
          can at least say "You" vs "Employee"/"Admin" rather than nothing.
          Skipped entirely for role="customer" -- these are internal
          admin/employee working notes, not customer-facing content. */}
      {record.notes && record.status !== "NONE" && role !== "customer" && (
        <div
          className={`mb-3 rounded-lg border p-2.5 ${
            record.status === "REJECTED"
              ? "border-status-cancelled bg-status-cancelled/10"
              : record.status === "PENDING_APPROVAL"
              ? "border-status-pending bg-status-pending/10"
              : "border-border bg-muted/30"
          }`}
        >
          <p
            className={`text-xs font-medium ${
              record.status === "REJECTED"
                ? "text-status-cancelled"
                : record.status === "PENDING_APPROVAL"
                ? "text-status-pending"
                : "text-foreground"
            }`}
          >
            {record.status === "REJECTED" &&
              (role === "admin" ? "You rejected the last proposal" : "Your last proposal was rejected")}
            {record.status === "PENDING_APPROVAL" &&
              (role === "employee" ? "Your note on this proposal" : "Employee's note on this proposal")}
            {record.status === "APPROVED" &&
              (role === "admin" ? "Your note on the last approval" : "Admin's note on the last approval")}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{record.notes}</p>
        </div>
      )}

      <div className={role === "customer" ? "flex flex-col gap-2.5" : "mb-3.5 flex flex-col gap-2.5"}>
        {rows.map((r) => (
          <TrackerStage key={r.stage} label={r.label} state={r.state} />
        ))}
      </div>

      {role === "admin" && hasPendingProposal && !isTerminal && (
        <div className="mb-3.5 flex flex-col gap-2">
          <form action={approveAction}>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Approve
            </button>
          </form>
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

      {role === "employee" && !hasPendingProposal && !isTerminal && (
        <details className="rounded-lg border border-border">
          <summary className="cursor-pointer px-3 py-2 text-center text-xs font-medium text-primary">
            Submit proposal
          </summary>
          <form action={proposeAction} className="flex flex-col gap-2 p-3 pt-0">
            {/* Only the two stages an employee may propose — enforced again
                server-side in proposeStage, this is purely for a clean UI. */}
            <select
              name="pendingStage"
              defaultValue={nextProposableDefault}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              {EMPLOYEE_PROPOSABLE_STAGES.map((stage) => (
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

      {role === "admin" && !isTerminal && (
        <div className="mt-3.5 border-t border-border pt-3.5">
          <p className="mb-1.5 text-[11px] text-muted-foreground">
            {record.assignedEmployeeId
              ? "Reassign employee"
              : "No employee assigned yet"}
          </p>
          <AssignEmployeeForm
            orderId={orderId}
            customDesignRequestId={customDesignRequestId}
            currentEmployeeId={record.assignedEmployeeId}
          />
        </div>
      )}
    </div>
  );
}