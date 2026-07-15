import { getMyMeasurements } from "@/lib/api/customers";
import { requireRole } from "@/lib/auth-guard";
import { MEASUREMENT_FIELDS } from "@/types/customer";
import { formatDate } from "@/lib/utils";
import { Ruler } from "lucide-react";

export default async function MyMeasurementsPage() {
  await requireRole("CUSTOMER");

  const result = await getMyMeasurements();
  const measurements = result.success ? result.data : [];

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  );

  return (
    <>
      <div className="mb-6 mt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your measurements
        </p>
        <h1 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl">
          Measurements
        </h1>
      </div>

      {!result.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Some information couldn&apos;t be loaded. Pull to refresh or try again shortly.
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Ruler className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">No measurements on file yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Your measurements are recorded by our team during a fitting appointment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((m, i) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {i === 0 ? "Most recent" : "Recorded"} — {formatDate(m.measuredAt)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {MEASUREMENT_FIELDS.map(({ key, label }) => {
                  const value = m[key];
                  if (value === null || value === undefined) return null;
                  return (
                    <div key={key}>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{String(value)} cm</p>
                    </div>
                  );
                })}
              </div>

              {m.notes && (
                <p className="mt-3 text-xs italic text-muted-foreground">Note: {m.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}