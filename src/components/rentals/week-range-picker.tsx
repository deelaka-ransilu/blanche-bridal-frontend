"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startOfWeek, addDays, toISODate, isSameDay } from "@/lib/date-utils";

export function WeekRangePicker({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  minStartDate,
}: {
  startValue: string; // "yyyy-MM-dd"
  endValue: string;
  onChangeStart: (isoDate: string) => void;
  onChangeEnd: (isoDate: string) => void;
  minStartDate?: Date;
}) {
  const today = startOfWeek(new Date());
  const floor = minStartDate ? startOfWeek(minStartDate) : today;
  const [weekStart, setWeekStart] = useState<Date>(floor);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function goPrevWeek() {
    const prev = addDays(weekStart, -7);
    setWeekStart(prev < floor ? floor : prev);
  }

  function goNextWeek() {
    setWeekStart(addDays(weekStart, 7));
  }

  const canGoPrev = weekStart > floor;

  function handleDayClick(iso: string) {
    // No start yet, or both already set -> start a fresh range
    if (!startValue || (startValue && endValue)) {
      onChangeStart(iso);
      onChangeEnd("");
      return;
    }
    // Start is set, no end yet
    if (iso < startValue) {
      // picked a day before start -> treat as new start
      onChangeStart(iso);
      onChangeEnd("");
    } else {
      onChangeEnd(iso);
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Rental period
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
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = toISODate(day);
            const isPast = day < floor;
            const isToday = isSameDay(day, new Date());
            const isStart = startValue === iso;
            const isEnd = endValue === iso;
            const inRange =
              startValue && endValue && iso > startValue && iso < endValue;

            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(iso)}
                className={`flex flex-col items-center rounded-md py-1.5 text-xs transition-colors ${
                  isStart || isEnd
                    ? "bg-primary text-primary-foreground"
                    : inRange
                      ? "bg-primary/15 text-foreground"
                      : isPast
                        ? "text-muted-foreground/40"
                        : "text-foreground hover:bg-accent"
                } ${isToday && !isStart && !isEnd ? "font-semibold" : ""}`}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {day.toLocaleDateString("en-LK", { weekday: "narrow" })}
                </span>
                <span>{day.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
          <span>
            Start: <span className="font-medium text-foreground">{startValue || "—"}</span>
          </span>
          <span>
            End: <span className="font-medium text-foreground">{endValue || "—"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}