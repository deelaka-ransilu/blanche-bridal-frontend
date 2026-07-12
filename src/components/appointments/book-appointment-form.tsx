"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
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

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 [color-scheme:dark]";

// Selects use appearance-none + a custom chevron so the native browser arrow
// (which doesn't match the dark theme) is replaced with one that does.
const selectClass = `${inputClass} appearance-none pr-9`;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
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
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-border bg-card p-5"
    >
      {/* Group 1: When */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">When</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              name="appointmentDate"
              required
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Time Slot</label>
            <SelectWrapper>
              <select
                name="timeSlot"
                required
                disabled={!date || loadingSlots || slots.length === 0}
                className={selectClass}
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
            </SelectWrapper>
            {slotsError && <p className="mt-1.5 text-sm text-destructive">{slotsError}</p>}
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Group 2: Details */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Details
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
            <SelectWrapper>
              <select name="type" required defaultValue="" className={selectClass}>
                <option value="" disabled>
                  Select type
                </option>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Product <span className="text-muted-foreground">(optional)</span>
            </label>
            <SelectWrapper>
              <select name="productId" defaultValue="" className={selectClass}>
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>

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
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}

      <Button type="submit" className="w-full">
        Book Appointment
      </Button>
    </form>
  );
}