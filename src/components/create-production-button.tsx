import { createProductionAction } from "@/lib/actions/production";
import { PRODUCTION_STAGE_ORDER, PRODUCTION_STAGE_LABELS } from "@/types/production";

export function CreateProductionButton({ orderId }: { orderId: string }) {
  const action = createProductionAction.bind(null, orderId);

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">Production tracking not started</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Starting tracking creates a checklist so you and the assigned employee can log progress
        through each stage below.
      </p>

      <ol className="mt-3 flex flex-wrap gap-1.5">
        {PRODUCTION_STAGE_ORDER.map((stage, i) => (
          <li
            key={stage}
            className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground"
          >
            <span className="text-[10px] font-medium text-muted-foreground/70">{i + 1}</span>
            {PRODUCTION_STAGE_LABELS[stage]}
          </li>
        ))}
      </ol>

      <form action={action} className="mt-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start production tracking
        </button>
      </form>
    </div>
  );
}