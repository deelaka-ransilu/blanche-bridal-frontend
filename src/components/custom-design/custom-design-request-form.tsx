"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  CalendarClock,
  Sparkles,
  Palette,
  ClipboardCheck,
  Check,
} from "lucide-react";
import {
  submitCustomDesignRequestAction,
  type SubmitCustomDesignState,
} from "@/lib/actions/production/custom-design";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage, type ImageUploaderHandle } from "@/components/products/image-uploader";
import { OCCASION_TYPE_LABELS, type OccasionType } from "@/types/custom-design";
import { DateCalendar } from "@/components/ui/date-calendar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MIN_LEAD_MINUTES = 60;

// How long (ms) to block submission right after the Review step first
// becomes visible. Guards against a double-click / ghost-click landing on
// "Continue" and then, at the same screen position, on "Request
// Consultation" the instant it swaps in — which would submit the form
// before the user ever saw the review screen.
const SUBMIT_GUARD_MS = 400;

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 [color-scheme:dark]";

const STEPS = [
  { key: "schedule", label: "Schedule", icon: CalendarClock },
  { key: "occasion", label: "Occasion", icon: Sparkles },
  { key: "style", label: "Style", icon: Palette },
  { key: "review", label: "Review", icon: ClipboardCheck },
] as const;

function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayAfter(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nowInColombo(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-destructive">{message}</p>;
}

function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              i < currentStep
                ? "bg-primary text-primary-foreground"
                : i === currentStep
                  ? "border-2 border-primary text-primary"
                  : "border border-border text-muted-foreground"
            }`}
          >
            {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-6 sm:w-10 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
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
          <p className="text-sm font-medium text-foreground">{title}</p>
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

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [occasionType, setOccasionType] = useState<OccasionType | "">("");
  const [occasionDate, setOccasionDate] = useState("");

  const [stylePreferences, setStylePreferences] = useState("");
  const [notes, setNotes] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const referenceImagesRef = useRef<ImageUploaderHandle>(null);
  const hiddenReferenceImagesRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submit guard: true for a short window right after the Review step
  // becomes visible. Prevents a double-click/ghost-click that lands on
  // "Continue" and then, at the same screen position, on the freshly
  // swapped-in "Request Consultation" button from submitting the form
  // before the user has actually seen the review screen.
  const [submitLocked, setSubmitLocked] = useState(false);
  const reviewEnteredAtRef = useRef<number>(0);

  useEffect(() => {
    if (step !== STEPS.length - 1) return;
    reviewEnteredAtRef.current = Date.now();
    setSubmitLocked(true);
    const timer = setTimeout(() => setSubmitLocked(false), SUBMIT_GUARD_MS);
    return () => clearTimeout(timer);
  }, [step]);

  const todayMin = todayLocal();
  const occasionMin = date ? dayAfter(date) : todayMin;

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setTimeSlot("");
    setSlots([]);
    setSlotsError(null);

    if (newDate && occasionDate && occasionDate <= newDate) {
      setOccasionDate("");
    }

    setLoadingSlots(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/slots?date=${newDate}`);
      const json = await res.json();
      if (json.success) {
        let available: string[] = json.data as string[];

        if (newDate === todayLocal()) {
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

  function goNext() {
    setStepError(null);

    if (step === 0) {
      if (!date || !timeSlot) {
        setStepError("Pick a date and time slot to continue.");
        return;
      }
    }

    if (step === 1) {
      if (!occasionType || !occasionDate) {
        setStepError("Fill in the occasion type and date to continue.");
        return;
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Reject any submit that fires while we're still inside the guard
    // window right after arriving at Review (see effect above). This
    // catches ghost/duplicate click events that a `disabled` attribute
    // alone might not stop.
    if (Date.now() - reviewEnteredAtRef.current < SUBMIT_GUARD_MS) {
      e.preventDefault();
      return;
    }

    if (!referenceImagesRef.current?.hasPending()) return;
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
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleFinalSubmit}
      className="space-y-4"
    >
      <ProgressDots currentStep={step} />

      {state && !state.success && (
        <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message || "Please check the highlighted fields below."}
        </div>
      )}

      {/* All fields stay mounted so values survive step changes and the
          existing name-attribute-based FormData submission keeps working
          unchanged -- only visibility toggles per step. */}

      <div className={step === 0 ? "block" : "hidden"}>
        <StepCard
          icon={CalendarClock}
          title="When would you like to meet our designer?"
          subtitle="Step 1 of 4 · Consultation date & time"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
              <input type="hidden" name="appointmentDate" value={date} required />
              <DateCalendar
                value={date}
                onChange={handleDateChange}
                minDate={todayMin}
                disableWeekdays={[0]}
                className="w-full max-w-xs mx-auto sm:max-w-sm"
              />
              <FieldError message={state?.fields?.appointmentDate} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Time Slot</label>

              {/* Hidden input keeps the existing FormData submission working unchanged */}
              <input type="hidden" name="timeSlot" value={timeSlot} required />

              {!date ? (
                <p className="text-sm text-muted-foreground">Pick a date first</p>
              ) : loadingSlots ? (
                <p className="text-sm text-muted-foreground">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        timeSlot === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}

              {slotsError && <p className="mt-1.5 text-sm text-destructive">{slotsError}</p>}
              <FieldError message={state?.fields?.timeSlot} />
            </div>
          </div>
        </StepCard>
      </div>

      <div className={step === 1 ? "block" : "hidden"}>
        <StepCard
          icon={Sparkles}
          title="What are you celebrating, and when?"
          subtitle="Step 2 of 4 · The occasion"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Occasion type
              </label>

              {/* Hidden input keeps the existing FormData submission working unchanged */}
              <input type="hidden" name="occasionType" value={occasionType} required />

              <div className="flex flex-wrap gap-2">
                {(Object.entries(OCCASION_TYPE_LABELS) as [OccasionType, string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOccasionType(value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        occasionType === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>

              <FieldError message={state?.fields?.occasionType} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Event date
              </label>

              <input type="hidden" name="occasionDate" value={occasionDate} required />

              <DateCalendar
                value={occasionDate}
                onChange={setOccasionDate}
                minDate={occasionMin}
                className="w-full max-w-xs mx-auto sm:max-w-sm"
              />

              <p className="mt-1.5 text-xs text-muted-foreground">
                Must be after your consultation date
              </p>
              <FieldError message={state?.fields?.occasionDate} />
            </div>
          </div>
        </StepCard>
      </div>

      <div className={step === 2 ? "block" : "hidden"}>
        <StepCard
          icon={Palette}
          title="Tell us about your dream dress"
          subtitle="Step 3 of 4 · Style & inspiration (optional)"
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
                value={stylePreferences}
                onChange={(e) => setStylePreferences(e.target.value)}
                placeholder="e.g. lace bodice, A-line silhouette, ivory silk…"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Reference images <span className="text-muted-foreground">(optional)</span>
              </label>
              <ImageUploader ref={referenceImagesRef} uploadContext="custom-design" />
              <input ref={hiddenReferenceImagesRef} type="hidden" name="referenceImages" />
              {uploadError && <p className="mt-1.5 text-sm text-destructive">{uploadError}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Anything else? <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </StepCard>
      </div>

      <div className={step === 3 ? "block" : "hidden"}>
        <StepCard
          icon={ClipboardCheck}
          title="Review your consultation request"
          subtitle="Step 4 of 4 · Make sure everything looks right"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Consultation</span>
              <span className="text-right font-medium text-foreground">
                {formatDateDisplay(date)} · {timeSlot || "—"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Occasion</span>
              <span className="text-right font-medium text-foreground">
                {occasionType ? OCCASION_TYPE_LABELS[occasionType] : "—"}
                {occasionDate ? ` · ${formatDateDisplay(occasionDate)}` : ""}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Style notes</span>
              <span className="max-w-[65%] text-right text-foreground">
                {stylePreferences || <span className="text-muted-foreground">Not provided</span>}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Anything else</span>
              <span className="max-w-[65%] text-right text-foreground">
                {notes || <span className="text-muted-foreground">Not provided</span>}
              </span>
            </div>
          </div>
        </StepCard>
      </div>

      {stepError && <p className="text-center text-sm text-destructive">{stepError}</p>}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="flex-1 border-2 border-border hover:border-primary/50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} className="flex-1">
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1"
            disabled={isUploadingImages || submitLocked}
          >
            {isUploadingImages
              ? "Uploading images…"
              : submitLocked
                ? "Request Consultation"
                : "Request Consultation"}
          </Button>
        )}
      </div>

      {step === STEPS.length - 1 && (
        <p className="text-center text-xs text-muted-foreground">
          No payment required — we&apos;ll reach out to confirm your slot.
        </p>
      )}
    </form>
  );
}