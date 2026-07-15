"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  time: string;
  customerName: string;
  type: string;
}

interface DayInfo {
  date: number;
  dayLabel: string;
  isToday: boolean;
  appointments: Appointment[];
}

// Dummy generator — swap for a real fetch keyed by week start date later.
// Deterministic per offset so navigating back/forth feels stable during dev.
function getDummyWeek(weekOffset: number): { rangeLabel: string; days: DayInfo[] } {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dummyAppointmentSets: Appointment[][] = [
    [
      { time: "10:00 AM", customerName: "Nethmi Silva", type: "Consultation" },
      { time: "2:30 PM", customerName: "Dilki Fernando", type: "Fitting" },
    ],
    [],
    [
      { time: "9:30 AM", customerName: "Amaya Perera", type: "Consultation" },
      { time: "11:00 AM", customerName: "Shanika Rathnayake", type: "Fitting" },
      { time: "4:00 PM", customerName: "Ruwan de Silva", type: "Pickup" },
    ],
    [{ time: "1:00 PM", customerName: "Nadeesha K.", type: "Fitting" }],
    [],
    [
      { time: "10:00 AM", customerName: "Chamodi Weerasinghe", type: "Consultation" },
      { time: "12:30 PM", customerName: "Tharindu Jayasuriya", type: "Fitting" },
      { time: "3:00 PM", customerName: "Ishara Bandara", type: "Consultation" },
      { time: "5:00 PM", customerName: "Kavindi Rajapaksa", type: "Pickup" },
    ],
    [],
  ];

  const today = new Date();
  const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + weekOffset * 7);

  const days: DayInfo[] = dayLabels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d.getDate(),
      dayLabel: label,
      isToday: weekOffset === 0 && i === currentDay,
      appointments: weekOffset === 0 ? dummyAppointmentSets[i] : dummyAppointmentSets[(i + Math.abs(weekOffset)) % 7],
    };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rangeLabel = `${fmt(monday)} – ${fmt(sunday)}`;

  return { rangeLabel, days };
}

export function WeekCalendarCard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { rangeLabel, days } = getDummyWeek(weekOffset);

  const todayIndex = days.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

  function changeWeek(delta: number) {
    setWeekOffset((w) => w + delta);
    setSelectedDayIndex(0);
  }

  const selectedDay = days[selectedDayIndex];

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
              i === selectedDayIndex
                ? "bg-primary/15 ring-1 ring-primary/40"
                : day.isToday
                  ? "bg-primary/10"
                  : "bg-secondary/40 hover:bg-secondary/70"
            }`}
          >
            <p className="text-[11px] text-muted-foreground">{day.dayLabel}</p>
            <p
              className={`mt-0.5 text-sm font-medium ${
                day.isToday || i === selectedDayIndex ? "text-primary" : "text-foreground"
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

      {/* Selected day's appointment list */}
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