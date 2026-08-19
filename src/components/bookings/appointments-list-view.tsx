"use client";

import { useMemo, useState } from "react";
import { Mail, StickyNote } from "lucide-react";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  completeAppointmentAction,
} from "@/lib/actions/engagement/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { Button } from "@/components/ui/button";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const FILTERS: { key: AppointmentStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function AppointmentsListView({ appointments }: { appointments: Appointment[] }) {
  const [filter, setFilter] = useState<AppointmentStatus | "ALL">("ALL");

  const counts = useMemo(() => {
    const map: Record<AppointmentStatus | "ALL", number> = {
      ALL: appointments.length,
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const a of appointments) map[a.status]++;
    return map;
  }, [appointments]);

  const filtered = useMemo(() => {
    const list = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);
    // Soonest upcoming first, consistent with the calendar's date grouping.
    return [...list].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  }, [appointments, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label} · {counts[f.key]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            No appointments.
          </p>
        )}

        {filtered.map((appt) => (
          <div key={appt.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(appt.customerName)}
                </div>
                <div>
                  <p className="font-medium leading-tight text-foreground">
                    {appt.customerName ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(appt.appointmentDate)} · {appt.timeSlot} ·{" "}
                    {appt.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>{appt.status}</StatusBadge>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              {appt.productName && <p>{appt.productName}</p>}
              {appt.customerEmail && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {appt.customerEmail}
                </p>
              )}
              {appt.notes && (
                <p className="flex items-start gap-1.5">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {appt.notes}
                </p>
              )}
              {appt.type === "CUSTOM_CONSULTATION" && (
                <div className="space-y-1 rounded-lg bg-primary/5 p-2.5 text-xs">
                  {appt.occasionType && <p>Occasion: {appt.occasionType}</p>}
                  {appt.occasionDate && <p>Occasion date: {appt.occasionDate}</p>}
                  {appt.stylePreferences && <p>Style: {appt.stylePreferences}</p>}
                </div>
              )}
            </div>

            {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
              <div className="mt-3">
                <RescheduleForm appointmentId={appt.id} />
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              {appt.status === "PENDING" && (
                <form action={confirmAppointmentAction.bind(null, appt.id)}>
                  <Button type="submit" size="sm">
                    Confirm
                  </Button>
                </form>
              )}
              {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                <form action={completeAppointmentAction.bind(null, appt.id)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="border-status-completed/40 text-status-completed hover:bg-status-completed/10 hover:text-status-completed"
                  >
                    Complete
                  </Button>
                </form>
              )}
              {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                <form action={cancelAppointmentAction.bind(null, appt.id)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="border-status-cancelled/40 text-status-cancelled hover:bg-status-cancelled/10 hover:text-status-cancelled"
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}