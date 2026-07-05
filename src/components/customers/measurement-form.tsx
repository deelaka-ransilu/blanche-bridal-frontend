"use client";

import { useActionState } from "react";
import {
  addMeasurementAction,
  updateMeasurementAction,
  type MeasurementFormState,
} from "@/lib/actions/customers";
import { MEASUREMENT_FIELDS, type CustomerMeasurement } from "@/types/customer";
import { Button } from "@/components/ui/button";

interface MeasurementFormProps {
  customerId: string;
  mode: "add" | "edit";
  existing?: CustomerMeasurement; // required when mode === "edit"
}

const initialState: MeasurementFormState = null;

export default function MeasurementForm({ customerId, mode, existing }: MeasurementFormProps) {
  const action =
    mode === "add"
      ? addMeasurementAction.bind(null, customerId)
      : updateMeasurementAction.bind(null, customerId, existing!.id);

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border p-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="999.99"
              name={key}
              defaultValue={existing?.[key] ?? ""}
              className="w-full rounded-md border border-border p-1.5 text-sm mt-1"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Notes</label>
        <textarea
          name="notes"
          defaultValue={existing?.notes ?? ""}
          rows={2}
          className="w-full rounded-md border border-border p-2 text-sm mt-1"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving..." : mode === "add" ? "Save Measurement Set" : "Update Measurement Set"}
        </Button>
        {state?.success && <span className="text-xs text-status-completed">{state.message}</span>}
        {state && !state.success && (
          <span className="text-xs text-status-cancelled">{state.message}</span>
        )}
      </div>
    </form>
  );
}