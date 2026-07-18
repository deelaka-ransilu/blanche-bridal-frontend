"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment as ApiAppointment } from "@/types/appointment";

interface DayAppointment {
  time: string;
  customerName: string;
  type: string;
}

interface DayInfo {
  date: number;
  dayLabel: string;
  isToday: boolean;
  appointments: DayAppointment[];
}

interface WeekCalendarCardProps {
  appointments: ApiAppointment[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMondayOfWeek(weekOffset: number): Date {
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateKey(d: Date): string {
  // local YYYY-MM-DD, avoids UTC-shift bugs from toISOString()
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildWeek(
  weekOffset: number,
  appointmentsByDate: Map<string, DayAppointment[]>,
): { rangeLabel: string; days: DayInfo[] } {
  const monday = getMondayOfWeek(weekOffset);
  const today = new Date();
  const todayKey = toDateKey(today);

  const days: DayInfo[] = DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    return {
      date: d.getDate(),
      dayLabel: label,
      isToday: key === todayKey,
      appointments: appointmentsByDate.get(key) ?? [],
    };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rangeLabel = `${fmt(monday)} – ${fmt(sunday)}`;

  return { rangeLabel, days };
}

export function WeekCalendarCard({ appointments }: WeekCalendarCardProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Bucket real appointments by date once, not per render of buildWeek
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, DayAppointment[]>();
    for (const appt of appointments) {
      const key = appt.appointmentDate; // assumes "YYYY-MM-DD" from backend LocalDate
      const list = map.get(key) ?? [];
      list.push({
        time: appt.timeSlot,
        customerName: appt.customerName ?? "Unknown",
        type: formatType(appt.type),
      });
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [appointments]);

  const { rangeLabel, days } = useMemo(
    () => buildWeek(weekOffset, appointmentsByDate),
    [weekOffset, appointmentsByDate],
  );

  const todayIndex = days.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

  function changeWeek(delta: number) {
    setWeekOffset((w) => w + delta);
    setSelectedDayIndex(0);
  }

  // clamp in case week changed and previous index is out of range / stale "today"
  const activeIndex = selectedDayIndex < days.length ? selectedDayIndex : 0;
  const selectedDay = days[activeIndex];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-heading text-[15px] font-medium text-foreground">Appointments this week</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">{rangeLabel}</span>
          <button
            type="button"
            onClick={() => changeWeek(1)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <button
            key={day.dayLabel + day.date}
            type="button"
            onClick={() => setSelectedDayIndex(i)}
            className={`rounded-lg px-1.5 py-2 text-center transition-colors ${
              i === activeIndex
                ? "bg-primary/15 ring-1 ring-primary/40"
                : day.isToday
                  ? "bg-primary/10"
                  : "bg-secondary/40 hover:bg-secondary/70"
            }`}
          >
            <p className="text-[11px] text-muted-foreground">{day.dayLabel}</p>
            <p
              className={`mt-0.5 text-sm font-medium ${
                day.isToday || i === activeIndex ? "text-primary" : "text-foreground"
              }`}
            >
              {day.date}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {day.appointments.length > 0 ? `${day.appointments.length}` : "—"}
            </p>
          </button>
        ))}
      </div>

      {weekOffset !== 0 && (
        <button
          type="button"
          onClick={() => {
            setWeekOffset(0);
            setSelectedDayIndex(0);
          }}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Back to this week
        </button>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium text-foreground">
          {selectedDay.dayLabel} {selectedDay.date}
          {selectedDay.isToday && <span className="ml-1.5 text-primary">· Today</span>}
        </p>
        {selectedDay.appointments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedDay.appointments.map((appt, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{appt.time}</span>
                <span className="flex-1 text-left text-foreground">{appt.customerName}</span>
                <span className="text-[11px] text-muted-foreground">{appt.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No appointments scheduled.</p>
        )}
      </div>
    </div>
  );
}

function formatType(type: string): string {
  // e.g. "CUSTOM_CONSULTATION" -> "Custom consultation"
  const words = type.toLowerCase().split("_");
  return words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}