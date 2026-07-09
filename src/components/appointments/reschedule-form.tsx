"use client";

import { useState, useTransition } from "react";
import { rescheduleAppointmentAction } from "@/lib/actions/appointments";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export function RescheduleForm({ appointmentId }: { appointmentId: string }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDateChange(newDate: string) {
    setDate(newDate);
    setSlots([]);
    setSlotsError(null);

    if (!newDate) return;

    startTransition(async () => {
      const result = await apiRequest<string[]>(`/api/appointments/slots?date=${newDate}`, {
        method: "GET",
      });
      if (result.success) {
        setSlots(result.data);
        if (result.data.length === 0) {
          setSlotsError("No open slots on this date.");
        }
      } else {
        setSlotsError(result.message);
      }
    });
  }

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted-foreground">Reschedule</summary>
      <form
        action={rescheduleAppointmentAction.bind(null, appointmentId)}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <input
          type="date"
          name="appointmentDate"
          required
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <select
          name="timeSlot"
          required
          disabled={!date || isPending || slots.length === 0}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="">
            {!date ? "Select a date first" : isPending ? "Loading..." : "Select a time"}
          </option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {slotsError && <p className="w-full text-xs text-destructive">{slotsError}</p>}
        <Button type="submit" size="sm" disabled={!date || slots.length === 0}>
          Confirm
        </Button>
      </form>
    </details>
  );
}