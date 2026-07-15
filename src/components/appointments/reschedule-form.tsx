"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { rescheduleAppointmentAction } from "@/lib/actions/appointments";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTH_OPTIONS_COUNT = 2; // current month + next month only
const MIN_LEAD_MINUTES = 60;

// Sri Lanka is UTC+5:30 with no DST. Parsing a Colombo-formatted string
// back through the runtime's *local* interpretation means every later
// getFullYear()/getMonth()/getDate()/getDay()/getHours() call on this Date
// (all of which read local fields) returns Colombo's wall-clock numbers,
// no matter where the browser physically is.
function nowInColombo(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Sunday-aligned start of the week containing `d` (day 0 = Sunday).
function startOfWeek(d: Date): Date {
  const copy = startOfDay(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function RescheduleForm({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);

  const today = useMemo(() => startOfDay(nowInColombo()), []);
  const todayKey = toDateKey(today);
  const earliestWeekStart = useMemo(() => startOfWeek(today), [today]);

  const latestWeekStart = useMemo(() => {
    const nextMonthEnd = endOfMonth(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    return startOfWeek(nextMonthEnd);
  }, [today]);

  const [weekStart, setWeekStart] = useState<Date>(earliestWeekStart);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const monthOptions = useMemo(() => {
    const options: { key: string; label: string; weekStart: Date }[] = [];
    for (let i = 0; i < MONTH_OPTIONS_COUNT; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const target = startOfWeek(monthDate) < earliestWeekStart
        ? earliestWeekStart
        : startOfWeek(monthDate);
      options.push({
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        label: monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        weekStart: target,
      });
    }
    return options;
  }, [today, earliestWeekStart]);

  const currentMonthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
  const canGoPrevWeek = weekStart > earliestWeekStart;
  const canGoNextWeek = weekStart < latestWeekStart;

  function goToPrevWeek() {
    if (!canGoPrevWeek) return;
    const prev = addDays(weekStart, -7);
    setWeekStart(prev < earliestWeekStart ? earliestWeekStart : prev);
  }

  function goToNextWeek() {
    if (!canGoNextWeek) return;
    const next = addDays(weekStart, 7);
    setWeekStart(next > latestWeekStart ? latestWeekStart : next);
  }

  function handleMonthChange(key: string) {
    const option = monthOptions.find((o) => o.key === key);
    if (option) setWeekStart(option.weekStart);
  }

  function selectDate(d: Date) {
    if (d.getDay() === 0) return; // Sunday -- shop closed

    const dateKey = toDateKey(d);
    setSelectedDate(dateKey);
    setSelectedSlot("");
    setSlots([]);
    setSlotsError(null);

    startTransition(async () => {
      const result = await apiRequest<string[]>(`/api/appointments/slots?date=${dateKey}`, {
        method: "GET",
      });
      if (result.success) {
        let available = result.data;

        if (dateKey === todayKey) {
          const now = nowInColombo();
          available = available.filter((slot) => {
            const [h, m] = slot.split(":").map(Number);
            const slotDate = new Date(now);
            slotDate.setHours(h, m, 0, 0);
            return slotDate.getTime() - now.getTime() > MIN_LEAD_MINUTES * 60 * 1000;
          });
        }

        setSlots(available);
        if (available.length === 0) {
          setSlotsError("No open slots on this date.");
        }
      } else {
        setSlotsError(result.message);
      }
    });
  }

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? "Cancel reschedule" : "Reschedule"}
      </button>

      {open && (
        <form
          action={rescheduleAppointmentAction.bind(null, appointmentId)}
          className="mt-3 space-y-4 rounded-xl border border-border/60 bg-background/40 p-4"
        >
          <input type="hidden" name="appointmentDate" value={selectedDate} />
          <input type="hidden" name="timeSlot" value={selectedSlot} />

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                New date
              </label>
              <select
                value={currentMonthKey}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              >
                {monthOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPrevWeek}
                disabled={!canGoPrevWeek}
                aria-label="Previous week"
                className="flex h-9 w-6 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="grid flex-1 grid-cols-7 gap-1.5">
                {weekDays.map((d) => {
                  const key = toDateKey(d);
                  const isSunday = d.getDay() === 0;
                  const isPast = d < today;
                  const isSelected = key === selectedDate;
                  const isDisabled = isSunday || isPast;

                  return (
                    <button
  key={key}
  type="button"
  disabled={isDisabled}
  onClick={() => selectDate(d)}
  className={cn(
    "flex w-full flex-shrink-0 flex-col overflow-hidden rounded-lg border transition-colors",
    isSelected
      ? "border-primary"
      : isDisabled
        ? "border-border/50 cursor-not-allowed opacity-50"
        : "border-border hover:border-primary/50",
  )}
>
  <span
    className={cn(
      "py-0.5 text-center text-[10px] font-medium tracking-wide",
      isSelected
        ? "bg-primary text-primary-foreground"
        : "bg-[var(--border)] text-muted-foreground",
    )}
  >
    {d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
  </span>
  <span
    className={cn(
      "py-1 text-center text-xl font-medium",
      isSelected
        ? "bg-background text-primary"
        : isDisabled
          ? "bg-background text-muted-foreground/50"
          : "bg-background text-foreground",
    )}
  >
    {d.getDate()}
  </span>
</button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goToNextWeek}
                disabled={!canGoNextWeek}
                aria-label="Next week"
                className="flex h-9 w-6 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Time slot
            </label>

            {!selectedDate && (
              <p className="text-sm text-muted-foreground">Pick a date first.</p>
            )}

            {selectedDate && isPending && (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            )}

            {selectedDate && !isPending && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const isSelected = slot === selectedSlot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}

            {slotsError && <p className="mt-1.5 text-sm text-destructive">{slotsError}</p>}
          </div>

          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={!selectedDate || !selectedSlot}
          >
            Confirm
          </Button>
        </form>
      )}
    </div>
  );
}