"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

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

export function AppointmentsCalendarView({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

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
              const statuses = Array.from(new Set(dayAppts.map((a) => a.status)));

              return (
                <div
                  key={cell.dateKey}
                  className={`flex h-11 flex-col items-center justify-center gap-1 rounded-xl text-xs sm:h-14 sm:text-sm ${
                    isToday ? "border border-primary text-primary" : "text-foreground"
                  }`}
                >
                  <span>{cell.day}</span>
                  {statuses.length > 0 && (
                    <div className="flex gap-0.5">
                      {statuses.slice(0, 3).map((s) => (
                        <span key={s} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[s]}`} />
                      ))}
                    </div>
                  )}
                </div>
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
    </div>
  );
}