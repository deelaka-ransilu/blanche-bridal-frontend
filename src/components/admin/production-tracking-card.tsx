// components/admin/production-tracking-card.tsx
import { Check } from "lucide-react";
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
        <form action={createAction}>
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background"
          >
            Start Production
          </button>
        </form>
      </div>
    );
  }

  const record = result.data;
  const currentIndex = PRODUCTION_STAGE_ORDER.indexOf(record.currentStage as ProductionStage);

  const updateStageAction = updateStageDirectAction.bind(null, orderId, customDesignRequestId);
  const hasPendingApproval = record.status === "PENDING_APPROVAL";
  const approveAction = approveProductionAction.bind(null, orderId, customDesignRequestId);
  const rejectAction = rejectProductionAction.bind(null, orderId, customDesignRequestId);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-4 text-sm font-medium text-foreground">
        Production tracking
      </p>

      {/* Stage stepper — connected vertical line, done/current/upcoming states */}
      <ol className="mb-4">
        {PRODUCTION_STAGE_ORDER.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === PRODUCTION_STAGE_ORDER.length - 1;

          return (
            <li key={stage} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[11px] top-6 h-full w-px ${
                    isDone ? "bg-emerald-500/50" : "bg-border"
                  }`}
                />
              )}
              <span
                className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`pt-0.5 text-[13px] ${
                  isCurrent
                    ? "font-medium text-foreground"
                    : isDone
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                }`}
              >
                {PRODUCTION_STAGE_LABELS[stage]}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground">
                    Current
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {hasPendingApproval && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="mb-1.5 text-[13px] text-foreground">
            Pending stage proposed:{" "}
            <span className="font-medium">
              {record.pendingStage
                ? PRODUCTION_STAGE_LABELS[record.pendingStage as ProductionStage]
                : "—"}
            </span>
          </p>
          {record.notes && (
            <p className="mb-2 text-[12px] text-muted-foreground">{record.notes}</p>
          )}
          <div className="flex gap-2">
            <form action={approveAction}>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Approve
              </button>
            </form>
            <form action={rejectAction} className="flex items-center gap-2">
              <input
                type="text"
                name="notes"
                placeholder="Rejection reason (optional)"
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="rounded-lg bg-status-cancelled px-3 py-1.5 text-xs font-medium text-white"
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual advance */}
      <div className="border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Update stage
        </p>
        <form action={updateStageAction} className="flex flex-wrap items-end gap-2">
          <select
            name="stage"
            defaultValue={record.currentStage}
            className="rounded-lg border border-border bg-background px-2.5 py-2 text-[13px]"
          >
            {PRODUCTION_STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {PRODUCTION_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            className="min-w-[160px] flex-1 rounded-lg border border-border bg-background px-2.5 py-2 text-[13px]"
          />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}