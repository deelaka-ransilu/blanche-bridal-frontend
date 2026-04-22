"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PublicNav } from "@/components/shared/PublicNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAvailableSlots, bookAppointment } from "@/lib/api/appointments";
import { AppointmentType, CreateAppointmentPayload } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

const APPOINTMENT_TYPES: {
  value: AppointmentType;
  label: string;
  description: string;
}[] = [
  {
    value: "FITTING",
    label: "Fitting",
    description: "Try on dresses and get the perfect fit with our stylists.",
  },
  {
    value: "RENTAL_PICKUP",
    label: "Rental Pickup",
    description: "Pick up your reserved rental dress for your special day.",
  },
  {
    value: "PURCHASE",
    label: "Purchase Consultation",
    description: "Explore our collection and find your dream dress to own.",
  },
];

// ── Inner component ───────────────────────────────────────────────────────────

function BookingContent() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    const iso = selectedDate.toISOString().split("T")[0];
    getAvailableSlots(iso)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  // Disable today and past dates, and Sundays
  function isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today || date.getDay() === 0;
  }

  // Advance step when type selected
  function handleTypeSelect(type: AppointmentType) {
    setSelectedType(type);
    setStep(3);
  }

  // Advance step when date selected
  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) setStep(4);
  }

  // Advance step when slot selected
  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot);
    setStep(5);
  }

  async function handleSubmit() {
    if (!selectedType || !selectedDate || !selectedSlot) return;

    // Redirect to login if not authenticated
    if (!session?.user?.backendToken) {
      router.push("/login?callbackUrl=/booking");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateAppointmentPayload = {
        appointmentDate: selectedDate.toISOString().split("T")[0],
        timeSlot: selectedSlot,
        type: selectedType,
        notes: notes.trim() || undefined,
      };

      await bookAppointment(payload, session.user.backendToken);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to book appointment";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNav />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border p-10 shadow-sm">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Appointment Requested!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your appointment for{" "}
              <span className="font-medium text-gray-800">
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>{" "}
              at{" "}
              <span className="font-medium text-gray-800">{selectedSlot}</span>{" "}
              has been submitted. We will confirm it shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/my/appointments")}
              >
                View My Appointments
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  setSuccess(false);
                  setStep(1);
                  setSelectedType(null);
                  setSelectedDate(undefined);
                  setSelectedSlot(null);
                  setNotes("");
                }}
              >
                Book Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main booking form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose a type, pick a date and time, and we will take care of the
            rest.
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  step >= s
                    ? "bg-amber-600 text-white"
                    : "bg-gray-200 text-gray-500",
                )}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={cn(
                    "h-0.5 w-8 transition-colors",
                    step > s ? "bg-amber-600" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* ── Step 1: Appointment type ── */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
              Step 1
            </p>
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Appointment Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {APPOINTMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeSelect(t.value)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-all hover:border-amber-400",
                    selectedType === t.value
                      ? "border-amber-600 bg-amber-50"
                      : "border-gray-200 bg-white",
                  )}
                >
                  <p className="font-semibold text-sm text-gray-900 mb-1">
                    {t.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Step 2: Selected type summary ── */}
          {selectedType && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Step 2
              </p>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Selected Type
              </h2>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                {APPOINTMENT_TYPES.find((t) => t.value === selectedType)?.label}
              </Badge>
              <button
                className="ml-3 text-xs text-muted-foreground underline"
                onClick={() => {
                  setSelectedType(null);
                  setStep(1);
                }}
              >
                Change
              </button>
            </div>
          )}

          {/* ── Step 3: Pick a date ── */}
          {step >= 3 && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Step 3
              </p>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Pick a Date
              </h2>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  className="rounded-xl border"
                />
              </div>
              {selectedDate && (
                <p className="text-sm text-center text-muted-foreground mt-3">
                  Selected:{" "}
                  <span className="font-medium text-gray-800">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Pick a time slot ── */}
          {step >= 4 && selectedDate && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Step 4
              </p>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Pick a Time Slot
              </h2>
              {slotsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading available slots...
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No slots available on this date. Please pick another day.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleSlotSelect(slot)}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                        selectedSlot === slot
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-amber-400",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 5: Notes + Submit ── */}
          {step >= 5 && selectedSlot && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Step 5
              </p>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Any Notes? (Optional)
              </h2>
              <Textarea
                placeholder="e.g. I am looking for something classic in ivory, size M..."
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                rows={3}
                className="mb-4"
              />

              {/* Booking summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-gray-900">
                    {
                      APPOINTMENT_TYPES.find((t) => t.value === selectedType)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-gray-900">
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-gray-900">
                    {selectedSlot}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Booking..."
                  : session?.user?.backendToken
                    ? "Confirm Appointment"
                    : "Login to Book"}
              </Button>
              {!session?.user?.backendToken && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You will be redirected to login and returned here after.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Outer page ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
