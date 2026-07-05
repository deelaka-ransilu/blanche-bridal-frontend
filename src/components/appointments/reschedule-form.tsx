"use client";

import { rescheduleAppointmentAction } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";

export function RescheduleForm({ appointmentId }: { appointmentId: string }) {
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
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <input
          type="text"
          name="timeSlot"
          placeholder="e.g. 10:00"
          required
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <Button type="submit" size="sm">
          Confirm
        </Button>
      </form>
    </details>
  );
}