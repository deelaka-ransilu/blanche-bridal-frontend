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
  type ProductionStage,
} from "@/types/production";

interface ProductionTrackingCardProps {
  orderId: string;
  customDesignRequestId: string;
}

export async function ProductionTrackingCard({
  orderId,
  customDesignRequestId,
}: ProductionTrackingCardProps) {
  const result = await getProductionForOrder(orderId);

  // Genuine failure (network/5xx/auth) — distinct from "no record yet"
  if (!result.found && "error" in result) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{result.error}</p>
      </div>
    );
  }

  // No ProductionStageRecord yet — offer to create one at the first stage
  if (!result.found) {
    const createAction = createProductionAction.bind(
      null,
      orderId,
      customDesignRequestId
    );
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium">Production Tracking</h3>
        <p className="text-sm text-muted-foreground">
          Production hasn&apos;t started yet for this order.
        </p>
        <form action={createAction}>
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
          >
            Start Production
          </button>
        </form>
      </div>
    );
  }

  const record = result.data;
  const currentIndex = PRODUCTION_STAGE_ORDER.indexOf(
    record.currentStage as ProductionStage
  );

  const updateStageAction = updateStageDirectAction.bind(
    null,
    orderId,
    customDesignRequestId
  );

  // Only shown if the record has a pending employee-proposed stage.
  // Employee-side propose flow is out of scope/dummy right now, so in
  // practice this branch may currently be unreachable — kept defensively
  // in case a stale PENDING_APPROVAL record exists from before that scope
  // decision.
  const hasPendingApproval = record.status === "PENDING_APPROVAL";
  const approveAction = approveProductionAction.bind(
    null,
    orderId,
    customDesignRequestId
  );
  const rejectAction = rejectProductionAction.bind(
    null,
    orderId,
    customDesignRequestId
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Production Tracking</h3>

      {/* Stage stepper */}
      <ol className="space-y-1">
        {PRODUCTION_STAGE_ORDER.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li
              key={stage}
              className={`text-sm flex items-center gap-2 ${
                isCurrent
                  ? "font-semibold text-black"
                  : isDone
                  ? "text-muted-foreground line-through"
                  : "text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isCurrent
                    ? "bg-black"
                    : isDone
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              {PRODUCTION_STAGE_LABELS[stage]}
            </li>
          );
        })}
      </ol>

      {hasPendingApproval && (
        <div className="rounded-md border bg-amber-50 p-3 space-y-2">
          <p className="text-sm">
            Pending stage proposed: {" "}
            <strong>
              {record.pendingStage
                ? PRODUCTION_STAGE_LABELS[record.pendingStage as ProductionStage]
                : "—"}
            </strong>
          </p>
          {record.notes && (
            <p className="text-xs text-muted-foreground">{record.notes}</p>
          )}
          <div className="flex gap-2">
            <form action={approveAction}>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white"
              >
                Approve
              </button>
            </form>
            <form action={rejectAction} className="flex items-center gap-2">
              <input
                type="text"
                name="notes"
                placeholder="Rejection reason (optional)"
                className="rounded-md border px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual advance — direct admin override, per 0a decision */}
      <form action={updateStageAction} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Set stage</label>
          <select
            name="stage"
            defaultValue={record.currentStage}
            className="rounded-md border px-2 py-1.5 text-sm"
          >
            {PRODUCTION_STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {PRODUCTION_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          name="notes"
          placeholder="Notes (optional)"
          className="rounded-md border px-2 py-1.5 text-sm flex-1"
        />
        <button
          type="submit"
          className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
        >
          Update Stage
        </button>
      </form>
    </div>
  );
}