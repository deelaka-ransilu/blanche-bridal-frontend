"use client";

import { useActionState, useState, useRef } from "react";
import { ChevronDown, CalendarClock, Sparkles, Palette, Check } from "lucide-react";
import {
  submitCustomDesignRequestAction,
  type SubmitCustomDesignState,
} from "@/lib/actions/custom-design";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage, type ImageUploaderHandle } from "@/components/products/image-uploader";
import { OCCASION_TYPE_LABELS, type OccasionType } from "@/types/custom-design";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 [color-scheme:dark]";

const selectClass = `${inputClass} appearance-none pr-9`;

// Local YYYY-MM-DD, not UTC — using toISOString() here would roll back to
// yesterday for anyone west of UTC in the evening, which would then also
// silently roll the `min` attribute back a day and let a past date through.
function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// One day after the given YYYY-MM-DD string, same format. Used so the event
// date's floor is strictly after the consultation date, not merely equal to
// it — matches the "Must be after your consultation date" copy already on
// the field.
function dayAfter(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
  const formRef = useRef<HTMLFormElement>(null);
const referenceImagesRef = useRef<ImageUploaderHandle>(null);
const hiddenReferenceImagesRef = useRef<HTMLInputElement>(null);
const [isUploadingImages, setIsUploadingImages] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  if (!referenceImagesRef.current?.hasPending()) return; // nothing to upload, let it submit normally
  e.preventDefault();
  setUploadError(null);
  setIsUploadingImages(true);
  try {
    const uploaded = await referenceImagesRef.current.uploadAll();
    if (hiddenReferenceImagesRef.current) {
      hiddenReferenceImagesRef.current.value = JSON.stringify(uploaded.map((img) => img.url));
    }
    formRef.current?.requestSubmit();
  } catch (err) {
    setUploadError(err instanceof Error ? err.message : "Could not upload images. Try again.");
  } finally {
    setIsUploadingImages(false);
  }
}

  // Event date field is user-editable independently of `date`, but its
  // floor depends on `date` — tracked separately so changing the
  // consultation date can push an already-picked-too-early event date
  // forward, rather than leaving an invalid combination silently in place.
  const [occasionDate, setOccasionDate] = useState("");

  const todayMin = todayLocal();
  // Event date must be strictly after the consultation date once one is
  // chosen; before that, today is the only floor that makes sense.
  const occasionMin = date ? dayAfter(date) : todayMin;

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setSlots([]);
    setSlotsError(null);

    // If the currently-picked event date no longer satisfies "after the
    // consultation date," clear it rather than silently submitting an
    // invalid combination — the input's `min` alone doesn't retroactively
    // invalidate a value that was valid when it was picked.
    if (newDate && occasionDate && occasionDate <= newDate) {
      setOccasionDate("");
    }

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
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4">
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
              min={todayMin}
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
            <input
              type="date"
              name="occasionDate"
              required
              min={occasionMin}
              value={occasionDate}
              onChange={(e) => setOccasionDate(e.target.value)}
              className={inputClass}
            />
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
            <ImageUploader ref={referenceImagesRef} uploadContext="custom-design" />
              <input ref={hiddenReferenceImagesRef} type="hidden" name="referenceImageUrls" />
              {uploadError && <p className="mt-1.5 text-sm text-destructive">{uploadError}</p>}
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
        <Button type="submit" className="w-full" disabled={isUploadingImages}>
          {isUploadingImages ? "Uploading images…" : "Request Consultation"}
        </Button>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">
          No payment required — we&apos;ll reach out to confirm your slot.
        </p>
      </div>
    </form>
  );
}