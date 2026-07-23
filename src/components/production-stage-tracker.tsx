import { Check } from "lucide-react";
import {
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STAGE_ORDER,
  type ProductionStageRecord,
} from "@/types/production";
import { AssignEmployeeForm } from "@/components/assign-employee-form";

type VisualState = "done" | "active" | "pending";

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
  customDesignRequestId?: string;
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
  const isTerminal = orderStatus === "COMPLETED" || orderStatus === "CANCELLED";

  const rows = PRODUCTION_STAGE_ORDER.map((stage, i) => {
    let state: VisualState;
    if (i < currentIndex) {
      state = "done";
    } else if (i === currentIndex) {
      state = "active";
    } else {
      state = "pending";
    }
    return { stage, label: PRODUCTION_STAGE_LABELS[stage], state };
  });

  // NOTE: propose/approve/reject flow is gone. Admin now advances stages
  // directly via ProductionTrackingCard + ProductionStepperForm on the
  // admin custom-order page — this component is no longer rendered there.
  // It's still used for employee (read-only) and customer (read-only)
  // order-detail views. The "assign employee" block below is dead in
  // practice for the same reason (admin doesn't reach this component), but
  // left in place since it's harmless and gated correctly if that ever
  // changes.

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-1 text-sm font-medium text-foreground">
        Production stage
      </p>
      <p className="mb-3.5 text-[11px] text-muted-foreground">
        {role === "admin" && "Admin view"}
        {role === "employee" && "Track this order's progress"}
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
          overwritten on every stage update (see types/production.ts) --
          there's no history, so this shows only the most recent note, not a
          log. Skipped entirely for role="customer" -- these are internal
          admin/employee working notes, not customer-facing content. */}
      {record.notes && record.status !== "NONE" && role !== "customer" && (
        <div className="mb-3 rounded-lg border border-border bg-muted/30 p-2.5">
          <p className="text-xs font-medium text-foreground">Latest note</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{record.notes}</p>
        </div>
      )}

      <div className={role === "customer" ? "flex flex-col gap-2.5" : "mb-3.5 flex flex-col gap-2.5"}>
        {rows.map((r) => (
          <TrackerStage key={r.stage} label={r.label} state={r.state} />
        ))}
      </div>

      {role === "admin" && !isTerminal &&
        (record.currentStage === "FABRIC_SOURCED_CUT" ||
          record.currentStage === "BASE_STRUCTURE_STITCHED") && (
        <div className="mt-3.5 border-t border-border pt-3.5">
          <p className="mb-1.5 text-[11px] text-muted-foreground">
            {record.assignedEmployeeId ? "Reassign employee" : "No employee assigned yet"}
          </p>
          <AssignEmployeeForm
            orderId={orderId}
            customDesignRequestId={customDesignRequestId ?? ""}
            currentEmployeeId={record.assignedEmployeeId}
          />
        </div>
      )}
    </div>
  );
}