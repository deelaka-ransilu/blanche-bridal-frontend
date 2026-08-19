// components/admin/production-stepper-form.tsx
"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { ProductionActionState } from "@/lib/actions/production/production";

const initialState: ProductionActionState = null;

export function ProductionStepperForm({
  stageOrder,
  stageLabels,
  currentStage,
  updateAction,
}: {
  stageOrder: string[];
  stageLabels: Record<string, string>;
  currentStage: string;
  updateAction: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
}) {
  const [state, formAction, isPending] = useActionState(updateAction, initialState);
  const currentIndex = stageOrder.indexOf(currentStage);
  const [selectedStage, setSelectedStage] = useState(currentStage);

  return (
    <form action={formAction}>
      <input type="hidden" name="stage" value={selectedStage} />

      {/* Read-only progress display */}
      <ol className="mb-4 flex items-center gap-1">
        {stageOrder.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li key={stage} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="text-center text-[10px] leading-tight text-muted-foreground">
                {stageLabels[stage]}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Explicit control for what to change it to */}
      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Update stage to
          </label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[13px]"
          >
            {stageOrder.map((stage) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            className="w-full min-w-[160px] rounded-lg border border-border bg-background px-2.5 py-2 text-[13px]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || selectedStage === currentStage}
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Updating…" : "Update"}
        </button>
      </div>

      {state && !state.success && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-status-cancelled">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {state.message || "Could not update the stage. Try again."}
        </p>
      )}
    </form>
  );
}