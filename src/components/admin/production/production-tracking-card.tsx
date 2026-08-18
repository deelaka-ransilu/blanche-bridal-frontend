// components/admin/production-tracking-card.tsx
import {
  approveProductionAction,
  rejectProductionAction,
  createProductionAction,
  updateStageDirectAction,
} from "@/lib/actions/production";
import { getProductionForOrder } from "@/lib/api/production";
import {
  PRODUCTION_STAGE_ORDER,
  PRODUCTION_STAGE_LABELS,
} from "@/types/production";
import { ProductionStepperForm } from "@/components/admin/production/production-stepper-form";
import { StartProductionForm } from "@/components/admin/production/start-production-form";
import { ApproveRejectProductionForm } from "@/components/admin/production/approve-reject-production-form";
import { AssignEmployeeForm } from "@/components/admin/production/assign-employee-form";
import type { OrderStatus } from "@/types/order";

interface ProductionTrackingCardProps {
  orderId: string;
  customDesignRequestId: string;
  orderStatus?: OrderStatus;
}

export async function ProductionTrackingCard({
  orderId,
  customDesignRequestId,
  orderStatus,
}: ProductionTrackingCardProps) {
  const result = await getProductionForOrder(orderId);

  if (!result.found && "error" in result) {
    return (
      <div className="rounded-xl border border-status-cancelled/30 bg-status-cancelled/5 p-4">
        <p className="text-sm text-status-cancelled">{result.error}</p>
      </div>
    );
  }

  if (!result.found) {
    const createAction = createProductionAction.bind(null, orderId, customDesignRequestId);
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-heading mb-1 text-sm font-medium text-foreground">
          Production tracking
        </p>
        <p className="mb-3 text-[13px] text-muted-foreground">
          Production hasn&apos;t started yet for this order.
        </p>
        <StartProductionForm action={createAction} />
      </div>
    );
  }

  const record = result.data;

  const updateStageAction = updateStageDirectAction.bind(null, orderId, customDesignRequestId);
  const hasPendingApproval = record.status === "PENDING_APPROVAL";
  const approveAction = approveProductionAction.bind(null, orderId, customDesignRequestId);
  const rejectAction = rejectProductionAction.bind(null, orderId, customDesignRequestId);

  const isTerminal = orderStatus === "COMPLETED" || orderStatus === "CANCELLED";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-3 text-sm font-medium text-foreground">
        Production tracking
      </p>

      <ProductionStepperForm
        stageOrder={PRODUCTION_STAGE_ORDER}
        stageLabels={PRODUCTION_STAGE_LABELS}
        currentStage={record.currentStage}
        updateAction={updateStageAction}
      />

      {hasPendingApproval && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="mb-1.5 text-[13px] text-foreground">
            Pending stage proposed:{" "}
            <span className="font-medium">
              {record.pendingStage
                ? PRODUCTION_STAGE_LABELS[record.pendingStage]
                : "—"}
            </span>
          </p>
          {record.notes && (
            <p className="mb-2 text-[12px] text-muted-foreground">{record.notes}</p>
          )}
          <ApproveRejectProductionForm approveAction={approveAction} rejectAction={rejectAction} />
        </div>
      )}

      {!isTerminal &&
        (record.currentStage === "FABRIC_SOURCED_CUT" ||
          record.currentStage === "BASE_STRUCTURE_STITCHED") && (
        <div className="mt-4 border-t border-border pt-3.5">
          <p className="mb-1.5 text-[11px] text-muted-foreground">
            {record.assignedEmployeeId ? "Reassign employee" : "No employee assigned yet"}
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