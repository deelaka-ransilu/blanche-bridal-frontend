"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
import { bookRentalAction, type BookRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WeekRangePicker } from "./week-range-picker";
import { WeekDatePicker } from "./week-date-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MIN_LEAD_MINUTES = 60;
const FITTING_CUTOFF_DAYS = 2; // fittingDate must be on/before rentalStart - 2 days

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nowInColombo(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
  });
}

export function RentalBookingForm({
  productId,
  rentalPricePerDay,
  sizes,
}: {
  productId: string;
  rentalPricePerDay?: number | null;
  sizes?: string[];
}) {
  const router = useRouter();
  const boundAction = bookRentalAction.bind(null, productId);
  const [state, formAction, isPending] = useActionState<BookRentalState, FormData>(
    boundAction,
    null,
  );

  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [fittingDate, setFittingDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const min = todayStr();
  // Earliest selectable rental start date — must leave enough room before
  // it for a fitting to happen at least FITTING_CUTOFF_DAYS days out.
  const minStartDate = new Date(
    new Date(min + "T00:00:00").getTime() + FITTING_CUTOFF_DAYS * 86400000,
  );

  useEffect(() => {
    if (state?.success && state.orderId) {
      router.push(`/my/rentals/${state.orderId}`);
    }
  }, [state, router]);

  // Fitting cutoff = rentalStart - 2 days. If it's already passed (or
  // today/tomorrow rentalStart leaves no valid window), there's nothing to
  // book a fitting for. With minStartDate enforced above this should be
  // structurally unreachable via the UI, but kept as a defensive check.
  const cutoffDate = rentalStart ? addDaysISO(rentalStart, -FITTING_CUTOFF_DAYS) : "";
  const cutoffHasPassed = cutoffDate !== "" && cutoffDate < min;

  // Clear fitting selections whenever the rental range changes, since the
  // cutoff (and therefore slot pool) shifts with it.
  useEffect(() => {
    setFittingDate("");
    setSelectedSlot("");
    setSlots([]);
    setSlotsError(null);
  }, [rentalStart, rentalEnd]);

  // Fetch fitting slots whenever fittingDate changes.
  useEffect(() => {
    setSelectedSlot("");
    setSlots([]);
    setSlotsError(null);

    if (!fittingDate) return;

    let cancelled = false;
    setLoadingSlots(true);

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/appointments/slots?date=${fittingDate}`);
        const json = await res.json();
        if (cancelled) return;

        if (json.success) {
          let available: string[] = json.data as string[];

          if (fittingDate === todayStr()) {
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
            setSlotsError("No available fitting slots left for this date.");
          }
        } else {
          setSlotsError(json.message ?? "Could not load available slots.");
        }
      } catch {
        if (!cancelled) setSlotsError("Could not reach the server. Try again.");
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fittingDate]);

  let rentalFee: number | null = null;
  let totalDays = 0;
  if (rentalPricePerDay != null && rentalStart && rentalEnd) {
    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays > 0) {
      rentalFee = totalDays * rentalPricePerDay;
    }
  }
  const dueNow = rentalFee != null ? Math.round(rentalFee * 0.5) : null;

  const hasSizes = sizes && sizes.length > 0;
  const sizeMissing = hasSizes && !selectedSize;
  const datesMissing = !rentalStart || !rentalEnd;
  const slotMissing = !selectedSlot;

  const canSubmit = !sizeMissing && !datesMissing && !cutoffHasPassed && !slotMissing;

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">How renting works</p>
        <p className="mt-1">
          Pick your rental dates, then book a fitting at least {FITTING_CUTOFF_DAYS} days
          before your rental starts — we need that time to alter, iron, and dry-clean the
          dress after your fitting. Pay 50% in cash at the shop when you come in for your
          fitting.
        </p>
      </div>

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      {hasSizes && (
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes!.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <input type="hidden" name="size" value={selectedSize ?? ""} />
          {state?.fields?.size && (
            <p className="mt-1 text-xs text-destructive">{state.fields.size}</p>
          )}
        </div>
      )}

      {/* ── Step 1: rental period ────────────────────────────────────── */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-foreground">Step 1 — Rental dates</p>
        <WeekRangePicker
          startValue={rentalStart}
          endValue={rentalEnd}
          onChangeStart={setRentalStart}
          onChangeEnd={setRentalEnd}
          minStartDate={minStartDate}
        />
        <input type="hidden" name="rentalStart" value={rentalStart} />
        <input type="hidden" name="rentalEnd" value={rentalEnd} />
        {state?.fields?.rentalStart && (
          <p className="mt-1 text-xs text-destructive">{state.fields.rentalStart}</p>
        )}
        {state?.fields?.rentalEnd && (
          <p className="mt-1 text-xs text-destructive">{state.fields.rentalEnd}</p>
        )}
      </div>

      {/* ── Step 2: fitting appointment ─────────────────────────────── */}
      {rentalStart && rentalEnd && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">
            Step 2 — Book a fitting
          </p>

          {cutoffHasPassed ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                A fitting must be booked by {formatDisplayDate(cutoffDate)}, which has
                already passed. Please choose a later rental start date.
              </span>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                Book your fitting on or before {formatDisplayDate(cutoffDate)}.
              </p>
              <WeekDatePicker
                label="Fitting date"
                value={fittingDate}
                onChange={setFittingDate}
                maxDate={new Date(cutoffDate + "T00:00:00")}
              />
              <input type="hidden" name="fittingDate" value={fittingDate} />

              <div className="mt-3">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Fitting time slot
                </label>

                {!fittingDate && (
                  <p className="text-sm text-muted-foreground">Pick a fitting date first.</p>
                )}
                {fittingDate && loadingSlots && (
                  <p className="text-sm text-muted-foreground">Loading slots…</p>
                )}
                {fittingDate && !loadingSlots && slots.length > 0 && (
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
                <input type="hidden" name="fittingTimeSlot" value={selectedSlot} />
                {state?.fields?.fittingTimeSlot && (
                  <p className="mt-1 text-xs text-destructive">{state.fields.fittingTimeSlot}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {rentalFee != null && dueNow != null && (
        <div className="space-y-1 rounded-lg bg-primary/8 px-3 py-2.5 text-sm">
          <p className="text-foreground">
            Rental fee ({totalDays} {totalDays === 1 ? "day" : "days"}):{" "}
            <span className="font-medium">{formatPrice(rentalFee)}</span>
          </p>
          <p className="text-foreground">
            Pay at fitting (50%): <span className="font-medium">{formatPrice(dueNow)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Bring cash to your fitting appointment. The remaining {formatPrice(rentalFee - dueNow)}{" "}
            plus a refundable security deposit is due at pickup on {formatDisplayDate(rentalStart)}.
          </p>
        </div>
      )}

      <Button type="submit" disabled={isPending || !canSubmit} className="w-full">
        {isPending
          ? "Booking..."
          : sizeMissing
            ? "Select a size to continue"
            : datesMissing
              ? "Select rental dates to continue"
              : cutoffHasPassed
                ? "Choose a later rental start date"
                : slotMissing
                  ? "Select a fitting time to continue"
                  : "Book fitting appointment"}
      </Button>
    </form>
  );
}