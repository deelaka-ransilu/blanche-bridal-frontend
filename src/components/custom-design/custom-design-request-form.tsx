"use client";

import { useActionState, useState } from "react";
import { ChevronDown, CalendarClock, Sparkles, Palette, Check } from "lucide-react";
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

// Each form group is its own visually distinct card with a numbered/iconed
// header, rather than one flat card with divider lines — gives the form a
// clearer sense of "steps" without the overhead of an actual multi-step
// wizard (all fields still submit together in one action).
function SectionCard({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            <span className="text-muted-foreground">Step {step} · </span>
            {title}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-completed/10">
          <Check className="h-6 w-6 text-status-completed" />
        </div>
        <p className="text-sm font-medium text-status-completed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <SectionCard
        step={1}
        icon={CalendarClock}
        title="Consultation date & time"
        subtitle="When would you like to meet our designer?"
      >
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
      </SectionCard>

      <SectionCard
        step={2}
        icon={Sparkles}
        title="The occasion"
        subtitle="What are you celebrating, and when?"
      >
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
            <p className="mt-1.5 text-xs text-muted-foreground">
              Must be after your consultation date
            </p>
            <FieldError message={state?.fields?.occasionDate} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        step={3}
        icon={Palette}
        title="Style & inspiration"
        subtitle="Optional, but it helps our designer prepare"
      >
        <div className="space-y-4">
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
      </SectionCard>

      <div className="rounded-2xl border border-border bg-card p-5">
        {state && !state.success && state.message && (
          <p className="mb-3 text-sm text-destructive">{state.message}</p>
        )}
        <Button type="submit" className="w-full">
          Request Consultation
        </Button>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">
          No payment required — we&apos;ll reach out to confirm your slot.
        </p>
      </div>
    </form>
  );
}