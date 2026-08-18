"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { RentableProduct, RentalBookingPath } from "@/types/rental";
import type { VisitType } from "../types";
import { STEP_LABEL } from "../types";

interface PaymentStepProps {
  visitType: VisitType;
  currentStep: string;

  // RENTAL
  createdOrderId: string | null;
  createdRentalId: string | null;
  rentalError: string | null;
  selectedGown: RentableProduct | null;
  rentalDays: number;
  rentalFee: number;
  amountDueNow: number;
  bookingPath: RentalBookingPath;
  rentalPaymentMethod: string;

  // CUSTOM
  createdCustomDesignRequestId: string | null;
  customDesignError: string | null;
}

export function PaymentStep({
  visitType,
  currentStep,
  createdOrderId,
  createdRentalId,
  rentalError,
  selectedGown,
  rentalDays,
  rentalFee,
  amountDueNow,
  bookingPath,
  rentalPaymentMethod,
  createdCustomDesignRequestId,
  customDesignError,
}: PaymentStepProps) {
  if (visitType === "RENTAL") {
    return (
      <div className="flex flex-col gap-4">
        {createdOrderId ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-status-completed/30 bg-status-completed/5 py-6 text-center">
            <Check className="h-5 w-5 text-status-completed" />
            <p className="text-sm font-medium text-status-completed">Rental booking created.</p>
            <p className="text-[11px] text-muted-foreground">
              Order #{createdOrderId.slice(0, 8).toUpperCase()}
            </p>
            {createdRentalId ? (
              <Link
                href={`/admin/rentals/${createdRentalId}`}
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                View rental
              </Link>
            ) : (
              // Defensive fallback — should be unreachable now that the
              // backend always returns rentalId for this flow (see
              // OrderResponse.rentalId / RentalServiceImpl.createRentalBooking),
              // but avoids ever rendering a broken/missing link if that
              // assumption ever breaks again.
              <Link
                href="/admin/orders"
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                View orders
              </Link>
            )}
          </div>
        ) : (
          <p className="text-xs text-destructive">
            {rentalError || "Something went wrong creating the booking — go back to measurements and try again."}
          </p>
        )}

        {selectedGown && (
          <div className="rounded-lg border border-dashed border-border p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{selectedGown.name}</span>
              <span>
                {rentalDays} day{rentalDays === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Rental fee (shop&apos;s earnings)</span>
              <span>Rs {rentalFee.toLocaleString("en-LK")}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-border pt-2 font-mono text-base font-semibold">
              <span className="text-foreground">Total due now</span>
              <span className="text-foreground">Rs {amountDueNow.toLocaleString("en-LK")}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {bookingPath === "SAME_DAY" ? "Full dress value" : "50% of dress value"} — paid via{" "}
              {rentalPaymentMethod === "CASH" ? "cash" : "PayHere"}.
              {bookingPath === "ADVANCE" && " Remaining 50% due at pickup."}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (visitType === "CUSTOM") {
    return (
      <div className="flex flex-col gap-4">
        {createdCustomDesignRequestId ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-status-completed/30 bg-status-completed/5 py-6 text-center">
            <Check className="h-5 w-5 text-status-completed" />
            <p className="text-sm font-medium text-status-completed">Custom design request created.</p>
            <p className="text-[11px] text-muted-foreground">
              Continue into the full quote → payment → production flow.
            </p>
            <Link
              href={`/admin/custom-orders/${createdCustomDesignRequestId}`}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Open custom order
            </Link>
          </div>
        ) : (
          <p className="text-xs text-destructive">
            {customDesignError || "Something went wrong creating the request — go back to measurements and try again."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-full items-center justify-center py-16">
        <p className="text-xs text-muted-foreground">
          &quot;{STEP_LABEL[currentStep]}&quot; step — coming next.
        </p>
      </div>
    </div>
  );
}