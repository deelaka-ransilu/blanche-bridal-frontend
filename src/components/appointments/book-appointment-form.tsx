"use client";

import { useActionState, useState } from "react";
import { bookAppointmentAction, type BookAppointmentState } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import type { AppointmentType } from "@/types/appointment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const TYPE_LABELS: Record<AppointmentType, string> = {
  FITTING: "Fitting",
  RENTAL_PICKUP: "Rental Pickup",
  PURCHASE: "Purchase",
};

interface Product {
  id: string;
  name: string;
}

export function BookAppointmentForm({ products }: { products: Product[] }) {
  const [state, formAction] = useActionState<BookAppointmentState, FormData>(
    bookAppointmentAction,
    null,
  );
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setSlots([]);
    setSlotsError(null);
    if (!newDate) return;

    setLoadingSlots(true);
    try {
      // Public (permitAll) endpoint -- safe to call directly, no token needed.
      const res = await fetch(`${API_URL}/api/appointments/slots?date=${newDate}`);
      const json = await res.json();
      if (json.success) {
        setSlots(json.data as string[]);
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
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Date</label>
        <input
          type="date"
          name="appointmentDate"
          required
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Time Slot</label>
        <select
          name="timeSlot"
          required
          disabled={!date || loadingSlots || slots.length === 0}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">
            {loadingSlots
              ? "Loading slots…"
              : !date
                ? "Pick a date first"
                : slots.length === 0
                  ? "No slots available"
                  : "Select a time"}
          </option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {slotsError && <p className="mt-1 text-sm text-destructive">{slotsError}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Type</label>
        <select
          name="type"
          required
          defaultValue=""
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select type
          </option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Product <span className="text-muted-foreground">(optional)</span>
        </label>
        <select
          name="productId"
          defaultValue=""
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Notes <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}

      <Button type="submit" className="w-full">
        Book Appointment
      </Button>
    </form>
  );
}