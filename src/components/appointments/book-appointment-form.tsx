"use client";

import { useActionState, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { bookAppointmentAction, type BookAppointmentState } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MIN_LEAD_MINUTES = 60;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nowInColombo(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
}

const APPOINTMENT_TYPES: { value: string; label: string }[] = [
  { value: "FITTING", label: "Fitting" },
  { value: "PURCHASE", label: "Purchase consultation" },
];

export function BookAppointmentForm() {
  const [state, formAction, isPending] = useActionState<BookAppointmentState, FormData>(
    bookAppointmentAction,
    null,
  );

  const [appointmentDate, setAppointmentDate] = useState("");
  const [type, setType] = useState("FITTING");
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const min = todayStr();

  async function handleDateChange(newDate: string) {
    setAppointmentDate(newDate);
    setSelectedSlot("");
    setSlots([]);
    setSlotsError(null);

    if (!newDate) return;

    setLoadingSlots(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/slots?date=${newDate}`);
      const json = await res.json();

      if (json.success) {
        let available: string[] = json.data as string[];

        if (newDate === todayStr()) {
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

  const slotMissing = !selectedSlot;

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Appointment type</p>
        <div className="flex flex-wrap gap-1.5">
          {APPOINTMENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                type === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
        {state?.fields?.type && (
          <p className="mt-1 text-xs text-destructive">{state.fields.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="appointmentDate" className="mb-1 block text-xs text-muted-foreground">
          Appointment date
        </label>
        <input
          id="appointmentDate"
          name="appointmentDate"
          type="date"
          required
          min={min}
          value={appointmentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        {state?.fields?.appointmentDate && (
          <p className="mt-1 text-xs text-destructive">{state.fields.appointmentDate}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Time slot
        </label>

        {!appointmentDate && (
          <p className="text-sm text-muted-foreground">Pick a date first.</p>
        )}
        {appointmentDate && loadingSlots && (
          <p className="text-sm text-muted-foreground">Loading slots…</p>
        )}
        {appointmentDate && !loadingSlots && slots.length > 0 && (
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

        {slotsError && (
          <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{slotsError}</span>
          </div>
        )}

        <input type="hidden" name="timeSlot" value={selectedSlot} />
        {state?.fields?.timeSlot && (
          <p className="mt-1 text-xs text-destructive">{state.fields.timeSlot}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-xs text-muted-foreground">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isPending || slotMissing} className="w-full">
        {isPending ? "Booking..." : slotMissing ? "Select a time to continue" : "Confirm booking"}
      </Button>
    </form>
  );
}