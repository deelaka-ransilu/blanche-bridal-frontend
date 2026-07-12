"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  submitCustomDesignRequestAction,
  type SubmitCustomDesignState,
} from "@/lib/actions/custom-design";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/products/image-uploader";
import { OCCASION_TYPE_LABELS, type OccasionType } from "@/types/custom-design";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 [color-scheme:dark]";

const selectClass = `${inputClass} appearance-none pr-9`;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-destructive">{message}</p>;
}

export function CustomDesignRequestForm() {
  const [state, formAction] = useActionState<SubmitCustomDesignState, FormData>(
    submitCustomDesignRequestAction,
    null,
  );

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setSlots([]);
    setSlotsError(null);
    if (!newDate) return;

    setLoadingSlots(true);
    try {
      // Reuses the same public appointment-slots endpoint as regular
      // appointment booking — consultations occupy the same calendar.
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

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-status-completed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-card p-5">
      {/* Group 1: When */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Consultation date & time
        </p>

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
            <FieldError message={state?.fields?.appointmentDate} />
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
            <FieldError message={state?.fields?.timeSlot} />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Group 2: The occasion */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The occasion
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Occasion type
            </label>
            <SelectWrapper>
              <select name="occasionType" required defaultValue="" className={selectClass}>
                <option value="" disabled>
                  Select type
                </option>
                {(Object.entries(OCCASION_TYPE_LABELS) as [OccasionType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </SelectWrapper>
            <FieldError message={state?.fields?.occasionType} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Event date
            </label>
            <input type="date" name="occasionDate" required className={inputClass} />
            <FieldError message={state?.fields?.occasionDate} />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Group 3: Style */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Style & inspiration
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Style / fabric preferences{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            name="stylePreferences"
            rows={3}
            placeholder="e.g. lace bodice, A-line silhouette, ivory silk…"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Reference images <span className="text-muted-foreground">(optional)</span>
          </label>
          <ImageUploader
            images={referenceImages}
            onChange={setReferenceImages}
            name="referenceImages"
            uploadContext="custom-design"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Anything else? <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea name="notes" rows={3} className={inputClass} />
        </div>
      </div>

      {state && !state.success && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" className="w-full">
        Request Consultation
      </Button>
    </form>
  );
}