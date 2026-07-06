"use client";

import { useState } from "react";
import type { CustomerMeasurement } from "@/types/customer";
import MeasurementForm from "@/components/customers/measurement-form";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface MeasurementListProps {
  customerId: string;
  measurements: CustomerMeasurement[];
}

export default function MeasurementList({ customerId, measurements }: MeasurementListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (measurements.length === 0) {
    return <p className="text-sm text-muted-foreground">No measurements recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {measurements.map((m) => (
        <div key={m.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Recorded {formatDate(m.measuredAt)}
              {m.notes ? ` · ${m.notes}` : ""}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditingId(editingId === m.id ? null : m.id)}
            >
              {editingId === m.id ? "Cancel" : "Edit"}
            </Button>
          </div>

          {editingId === m.id && (
            <MeasurementForm customerId={customerId} mode="edit" existing={m} />
          )}
        </div>
      ))}
    </div>
  );
}