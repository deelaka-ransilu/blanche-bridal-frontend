"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Mail, StickyNote } from "lucide-react";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  completeAppointmentAction,
} from "@/lib/actions/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { Button } from "@/components/ui/button";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const STATUS_DOT_CLASS: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-primary",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-muted-foreground/50",
};

const STATUS_LEGEND: { status: AppointmentStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "COMPLETED", label: "Completed" },
  { status: "CANCELLED", label: "Cancelled" },
];

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function toDateKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function mondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AppointmentsCalendarView({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const list = map.get(appt.appointmentDate) ?? [];
      list.push(appt);
      map.set(appt.appointmentDate, list);
    }
    return map;
  }, [appointments]);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = mondayIndex(firstOfMonth.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, dateKey: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, dateKey: toDateKey(year, month, d) });

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedAppointments = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthTotal = Array.from(byDate.entries())
    .filter(([k]) => k.startsWith(monthPrefix))
    .reduce((sum, [, v]) => sum + v.length, 0);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="w-36 text-center font-heading text-sm font-medium text-foreground sm:w-40 sm:text-base">
                {monthLabel}
              </h2>
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((w, i) => (
              <div key={`${w}-${i}`} className="pb-1.5 text-center text-[11px] text-muted-foreground">
                {w}
              </div>
            ))}

            {cells.map((cell, i) => {
              if (cell.day === null) return <div key={`empty-${i}`} className="h-11 sm:h-14" />;

              const dayAppts = byDate.get(cell.dateKey!) ?? [];
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDate;
              const statuses = Array.from(new Set(dayAppts.map((a) => a.status)));
              const hasAppts = dayAppts.length > 0;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => hasAppts && setSelectedDate(cell.dateKey!)}
                  className={`flex h-11 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors sm:h-14 sm:text-sm ${
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "border border-primary text-primary"
                        : "text-foreground hover:bg-primary/5"
                  } ${hasAppts ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span>{cell.day}</span>
                  {statuses.length > 0 && (
                    <div className="flex gap-0.5">
                      {statuses.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-primary-foreground" : STATUS_DOT_CLASS[s]
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {STATUS_LEGEND.map((l) => (
                <div key={l.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[l.status]}`} />
                  {l.label}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{monthTotal}</span> this month
            </p>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="font-heading text-base font-medium text-foreground">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedAppointments.length} appointment{selectedAppointments.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(85vh-72px)] space-y-3 overflow-y-auto p-5">
              {selectedAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground">No appointments.</p>
              )}
              {selectedAppointments.map((appt) => (
                <div key={appt.id} className="rounded-xl border border-border p-4">
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
                          {appt.type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>
                      {appt.status}
                    </StatusBadge>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p>
                      {appt.timeSlot}
                      {appt.productName ? ` · ${appt.productName}` : ""}
                    </p>
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
                        <Button type="submit" size="sm" variant="outline">
                          Complete
                        </Button>
                      </form>
                    )}
                    {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                      <form action={cancelAppointmentAction.bind(null, appt.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}