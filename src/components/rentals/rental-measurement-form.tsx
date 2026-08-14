"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { addMeasurementAction, type MeasurementFormState } from "@/lib/actions/customers";
import type { CustomerMeasurement } from "@/types/customer";
import { MEASUREMENT_FIELDS } from "@/types/customer";
import { Button } from "@/components/ui/button";

type MeasurementValues = Partial<Record<keyof CustomerMeasurement, string>>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RentalMeasurementForm({
  customerId,
  measurements,
}: {
  customerId: string;
  measurements: CustomerMeasurement[];
}) {
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [measurementValues, setMeasurementValues] = useState<MeasurementValues>({});
  const [measurementNotes, setMeasurementNotes] = useState("");
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementFormState>(null);

  function setMeasurementField(key: keyof CustomerMeasurement, value: string) {
    setMeasurementValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submitMeasurement() {
    setSavingMeasurement(true);
    setMeasurementResult(null);

    const formData = new FormData();
    for (const { key } of MEASUREMENT_FIELDS) {
      formData.set(key, measurementValues[key] ?? "");
    }
    formData.set("notes", measurementNotes);

    const result = await addMeasurementAction(customerId, null, formData);
    setSavingMeasurement(false);
    setMeasurementResult(result);

    if (result?.success) {
      setMeasurementValues({});
      setMeasurementNotes("");
      setShowAddMeasurement(false);
    }
  }

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Measurements
        </p>
        {!showAddMeasurement && (
          <button
            onClick={() => setShowAddMeasurement(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add measurement set
          </button>
        )}
      </div>

      {showAddMeasurement && (
        <div className="mb-5 rounded-2xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">New measurement set</p>
            <button
              onClick={() => {
                setShowAddMeasurement(false);
                setMeasurementResult(null);
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-[11px] text-muted-foreground">{label}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="999.99"
                  value={measurementValues[key] ?? ""}
                  onChange={(e) => setMeasurementField(key, e.target.value)}
                  placeholder="—"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-foreground">Notes</label>
            <textarea
              value={measurementNotes}
              onChange={(e) => setMeasurementNotes(e.target.value)}
              rows={3}
              placeholder="Anything the tailor should know about this fitting..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {measurementResult && !measurementResult.success && (
            <p className="mt-2 text-xs text-destructive">{measurementResult.message}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button type="button" onClick={submitMeasurement} disabled={savingMeasurement} size="sm">
              {savingMeasurement && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {savingMeasurement ? "Saving…" : "Save measurement set"}
            </Button>
          </div>
        </div>
      )}

      {sortedMeasurements.length === 0 && !showAddMeasurement && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No measurements recorded yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {sortedMeasurements.map((m) => (
          <details key={m.id} className="rounded-2xl border border-border">
            <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 transition-colors hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {formatDate(m.measuredAt)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {MEASUREMENT_FIELDS.filter(({ key }) => m[key] !== null).length} fields recorded
                </span>
              </div>
            </summary>
            <div className="border-t border-border px-4 py-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {MEASUREMENT_FIELDS.filter(({ key }) => m[key] !== null).map(({ key, label }) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground">{m[key]}</span>
                  </div>
                ))}
              </div>
              {m.notes && (
                <p className="mt-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
                  {m.notes}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}