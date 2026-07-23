"use client";

import { MEASUREMENT_FIELDS, type CustomerMeasurement } from "@/types/customer";
import type { AdminUser } from "@/types/user";
import type { VisitType, MeasurementValues } from "../types";

interface MeasurementsStepProps {
  visitType: VisitType;
  selectedCustomer: AdminUser | null;
  measurementValues: MeasurementValues;
  setMeasurementField: (key: keyof CustomerMeasurement, value: string) => void;
  measurementNotes: string;
  setMeasurementNotes: (v: string) => void;
  measurementsSaved: boolean;
  measurementError: string | null;
  rentalError: string | null;
  customDesignError: string | null;
}

export function MeasurementsStep({
  visitType,
  selectedCustomer,
  measurementValues,
  setMeasurementField,
  measurementNotes,
  setMeasurementNotes,
  measurementsSaved,
  measurementError,
  rentalError,
  customDesignError,
}: MeasurementsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Recorded as a new measurement set for{" "}
        {selectedCustomer?.firstName ?? "this customer"}. Leave any field blank if it wasn&apos;t taken.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
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
              className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">
          Notes{visitType === "RENTAL" ? " (fit-check / alteration notes)" : ""}
        </label>
        <textarea
          value={measurementNotes}
          onChange={(e) => setMeasurementNotes(e.target.value)}
          rows={3}
          placeholder="Anything the tailor should know about this fitting..."
          className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {measurementsSaved && <p className="text-xs text-status-completed">Measurements saved.</p>}
      {measurementError && <p className="text-xs text-destructive">{measurementError}</p>}
      {rentalError && <p className="text-xs text-destructive">{rentalError}</p>}
      {customDesignError && <p className="text-xs text-destructive">{customDesignError}</p>}
    </div>
  );
}
