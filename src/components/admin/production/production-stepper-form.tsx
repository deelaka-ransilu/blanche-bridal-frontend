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
  // Bound with orderId + customDesignRequestId already applied at the call
  // site (production-tracking-card.tsx) — this component supplies the
  // remaining (prevState, formData) pair via useActionState itself, which
  // is what actually surfaces a failure inline instead of it only showing
  // up as "nothing changed" after revalidatePath.
  updateAction: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
}) {
  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  const currentIndex = stageOrder.indexOf(currentStage);
  const [selectedStage, setSelectedStage] = useState(currentStage);
  const selectedIndex = stageOrder.indexOf(selectedStage);

  return (
    <form action={formAction}>
      <input type="hidden" name="stage" value={selectedStage} />

      {/* Stage stepper — click a dot to pick the stage you're updating to */}
      <div className="mb-4">
        <ol className="flex items-start">
          {stageOrder.map((stage, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isSelected = stage === selectedStage;
            const isLast = i === stageOrder.length - 1;

            return (
              <li key={stage} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
                <div className="flex shrink-0 flex-col items-center" style={{ width: 88 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    aria-pressed={isSelected}
                    aria-label={`Select stage: ${stageLabels[stage]}`}
                    className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : isCurrent
                          ? "bg-foreground text-background"
                          : "border border-border bg-background text-muted-foreground hover:border-foreground/40"
                    } ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </button>
                  <span
                    className={`mt-1.5 px-1 text-center text-[11px] leading-tight ${
                      isSelected
                        ? "font-medium text-foreground"
                        : isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {stageLabels[stage]}
                  </span>
                </div>
                {!isLast && (
                  <span
                    className={`mt-3.5 h-[3px] flex-1 rounded-full ${
                      isDone ? "bg-emerald-500" : i < selectedIndex ? "bg-primary/40" : "bg-border"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <div className="flex-1">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {selectedStage === currentStage ? "Add a note" : `Update to: ${stageLabels[selectedStage]}`}
          </p>
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            className="w-full min-w-[160px] rounded-lg border border-border bg-background px-2.5 py-2 text-[13px]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
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