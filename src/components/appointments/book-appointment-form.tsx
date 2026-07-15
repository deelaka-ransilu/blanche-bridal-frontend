"use client";

import { useActionState, useMemo, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { bookAppointmentAction, type BookAppointmentState } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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

// Last day of the month containing `d`, at midnight.
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 [color-scheme:dark]";

export function BookAppointmentForm() {
  const [state, formAction] = useActionState<BookAppointmentState, FormData>(
    bookAppointmentAction,
    null,
  );

  const today = useMemo(() => startOfDay(nowInColombo()), []);
  const todayKey = toDateKey(today);
  const earliestWeekStart = useMemo(() => startOfWeek(today), [today]);

  // Bookings are only allowed within the current month + next month --
  // the last selectable week is the one containing the last day of next
  // month.
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
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const options: { key: string; label: string; weekStart: Date }[] = [];
    for (let i = 0; i < MONTH_OPTIONS_COUNT; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      // Jumping to a month lands on the week containing its 1st, but never
      // before the current real-world week (relevant for i === 0).
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

  async function selectDate(d: Date) {
    if (d.getDay() === 0) return; // Sunday -- shop closed, not selectable

    const dateKey = toDateKey(d);
    setSelectedDate(dateKey);
    setSelectedSlot("");
    setSlots([]);
    setSlotsError(null);
    setLoadingSlots(true);

    try {
      const res = await fetch(`${API_URL}/api/appointments/slots?date=${dateKey}`);
      const json = await res.json();
      if (json.success) {
        let available: string[] = json.data as string[];

        // If booking for today (Sri Lanka time), drop slots that have
        // already passed or don't meet the minimum lead time. UX filter
        // only -- the backend re-validates this on submit.
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
          setSlotsError("No available slots left for this date.");
        }
      } else {
        setSlotsError(json.message ?? "Could not load available slots.");
      }
    } catch {
      setSlotsError("Could not reach the server. Try again.");
    } finally {
      setLoadingSlots(false);
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-border bg-card p-5"
    >
      {/* This form only books fittings -- appointment "type" is fixed to
          FITTING and not exposed to the customer. RENTAL_PICKUP / PURCHASE
          remain valid on the backend for admin-side use; CUSTOM_CONSULTATION
          has its own dedicated flow at /my/custom-design/new. */}
      <input type="hidden" name="type" value="FITTING" />
      <input type="hidden" name="appointmentDate" value={selectedDate} />
      <input type="hidden" name="timeSlot" value={selectedSlot} />

      {/* Group 1: When */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">When</p>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-foreground">Date</label>
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
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" /> Time Slot
          </label>

          {!selectedDate && (
            <p className="text-sm text-muted-foreground">Pick a date first.</p>
          )}

          {selectedDate && loadingSlots && (
            <p className="text-sm text-muted-foreground">Loading slots…</p>
          )}

          {selectedDate && !loadingSlots && slots.length > 0 && (
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
      </div>

      <div className="h-px bg-border" />

      {/* Group 2: Details */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Details
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Notes <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea name="notes" rows={3} className={inputClass} />
        </div>
      </div>

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={!selectedDate || !selectedSlot}>
        Book Appointment
      </Button>
    </form>
  );
}