"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateCalendarProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  minDate?: string; // "YYYY-MM-DD"
  disableWeekdays?: number[]; // 0 = Sunday, 1 = Monday, ...
  className?: string; // layout/sizing is decided by the caller, not baked in here
}

function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TOTAL_CELLS = 42; // fixed 6 rows x 7 cols, so height never shifts between months

export function DateCalendar({
  value,
  onChange,
  minDate,
  disableWeekdays = [],
  className,
}: DateCalendarProps) {
  const initial = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const min = minDate ? new Date(`${minDate}T00:00:00`) : null;

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
  while (cells.length < TOTAL_CELLS) cells.push(null);

  function goPrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function isDisabled(d: Date): boolean {
    if (disableWeekdays.includes(d.getDay())) return true;
    if (min && d < min) return true;
    return false;
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-3 sm:p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-foreground">
          {firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="h-9 sm:h-10" />;
          const dateStr = toDateStr(d);
          const disabled = isDisabled(d);
          const selected = dateStr === value;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              className={`mx-auto flex h-9 w-full max-w-10 items-center justify-center rounded-lg text-xs transition-colors sm:h-10 sm:text-sm ${
                selected
                  ? "bg-primary font-medium text-primary-foreground"
                  : disabled
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : "text-foreground hover:bg-muted"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}