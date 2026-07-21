"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function WeekDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  value: string; // "yyyy-MM-dd"
  onChange: (isoDate: string) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const today = startOfWeek(new Date());
  const [weekStart, setWeekStart] = useState<Date>(today);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const floor = minDate ?? today;

  function goPrevWeek() {
    const prev = addDays(weekStart, -7);
    setWeekStart(prev < floor ? floor : prev);
  }

  function goNextWeek() {
    const next = addDays(weekStart, 7);
    if (maxDate && next > maxDate) return;
    setWeekStart(next);
  }

  const canGoPrev = weekStart > floor;
  const canGoNext = !maxDate || addDays(weekStart, 7) <= maxDate;

  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="rounded-lg border border-border p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevWeek}
            disabled={!canGoPrev}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium text-foreground">
            {weekStart.toLocaleDateString("en-LK", { month: "short", day: "numeric" })} –{" "}
            {addDays(weekStart, 6).toLocaleDateString("en-LK", { month: "short", day: "numeric" })}
          </span>
          <button
            type="button"
            onClick={goNextWeek}
            disabled={!canGoNext}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = toISODate(day);
            const isSelected = value === iso;
            const isPast = day < floor || (maxDate ? day > maxDate : false);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => onChange(iso)}
                className={`flex flex-col items-center rounded-md py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isPast
                      ? "text-muted-foreground/40"
                      : "text-foreground hover:bg-accent"
                } ${isToday && !isSelected ? "font-semibold" : ""}`}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {day.toLocaleDateString("en-LK", { weekday: "narrow" })}
                </span>
                <span>{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}