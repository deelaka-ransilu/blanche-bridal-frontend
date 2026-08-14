import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { FittingAppointmentCard } from "@/components/rentals/fitting-appointment-card";
import { RentalTracker } from "@/components/rentals/rental-tracker";
import { ConfirmCashPaymentButton } from "@/components/orders/confirm-cash-payment-button";
import { ConfirmHandoverForm } from "@/components/rentals/confirm-handover-form";
import { MarkReturnedForm } from "@/components/rentals/mark-returned-form";
import { CancelRentalButton } from "@/components/rentals/cancel-rental-button";
import type { Rental, RentalStatus } from "@/types/rental";
import type { CustomerMeasurement } from "@/types/customer";
import { RentalNotesForm } from "@/components/rentals/rental-notes-form";
import { RentalMeasurementForm } from "@/components/rentals/rental-measurement-form";
import { PaymentMethodPillToggle } from "@/components/admin/payment-method-switch";

const RENTAL_STATUS_MAP: Record<RentalStatus, Status> = {
  PENDING_PAYMENT: "pending",
  BOOKED: "progress",
  ACTIVE: "progress",
  OVERDUE: "cancelled",
  RETURNED: "completed",
  CANCELLED: "cancelled",
};

const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  BOOKED: "Booked",
  ACTIVE: "Active",
  OVERDUE: "Overdue",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

function formatCurrency(amount: number | null): string {
  if (amount == null) return "—";
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export function AdminRentalDetail({
  rental,
  measurements,
}: {
  rental: Rental;
  measurements: CustomerMeasurement[];
}) {
  const canCancel = rental.status === "PENDING_PAYMENT" || rental.status === "BOOKED";
  const canMarkReturned = rental.status === "ACTIVE" || rental.status === "OVERDUE";
  const isSameDay = rental.bookingPath === "SAME_DAY";

  const installment = rental.dressValue != null ? Math.round(rental.dressValue * 0.5) : null;

  // ADVANCE: due now at booking is 50% of dressValue, due at handover is
  // the remaining 50%. SAME_DAY: due now is the full dressValue, and there
  // is no separate handover payment at all for this path.
  const amountDueNow = isSameDay ? rental.dressValue : installment;
  const handoverTotal =
    !isSameDay && rental.dressValue != null && installment != null
      ? rental.dressValue - installment
      : null;

  // The pill toggle only understands CASH/PAYHERE — CARD and BANK_TRANSFER
  // aren't switch targets for this in-shop workflow, so it's hidden for
  // those (shouldn't occur for rental deposits today, but not assumed).
  const showPaymentToggle = rental.paymentMethod === "CASH" || rental.paymentMethod === "PAYHERE";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-medium text-foreground">
            {rental.productName ?? "Rental"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {rental.customerName} · {rental.customerEmail}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {rental.rentalStart} → {rental.rentalEnd} · {isSameDay ? "Same-day pickup" : "Advance booking"}
          </p>
        </div>
        <StatusBadge status={RENTAL_STATUS_MAP[rental.status]}>
          {RENTAL_STATUS_LABEL[rental.status]}
        </StatusBadge>
      </div>

      <div className="flex flex-col gap-4">
        {rental.fittingDate && rental.fittingTimeSlot && (
          <FittingAppointmentCard date={rental.fittingDate} timeSlot={rental.fittingTimeSlot} />
        )}

        <RentalTracker rental={rental} hidePaymentInstructions />

        {/* ── Status-specific action panel ─────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Next step
            </p>
            {rental.status === "PENDING_PAYMENT" && rental.orderId && showPaymentToggle && (
              <PaymentMethodPillToggle
                orderId={rental.orderId}
                rentalId={rental.id}
                currentMethod={rental.paymentMethod as "CASH" | "PAYHERE"}
              />
            )}
            {!isSameDay &&
              rental.status === "BOOKED" &&
              rental.handoverOrderId &&
              showPaymentToggle && (
                <PaymentMethodPillToggle
                  orderId={rental.handoverOrderId}
                  rentalId={rental.id}
                  currentMethod={rental.paymentMethod as "CASH" | "PAYHERE"}
                />
              )}
          </div>

          {rental.status === "PENDING_PAYMENT" && rental.orderId && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">
                {isSameDay
                  ? `Waiting for the full dress value payment${
                      amountDueNow != null ? ` (${formatCurrency(amountDueNow)})` : ""
                    }.`
                  : `Waiting for the 50% dress value payment${
                      amountDueNow != null ? ` (${formatCurrency(amountDueNow)})` : ""
                    }.`}
              </p>
              <ConfirmCashPaymentButton
                orderId={rental.orderId}
                amountLabel={amountDueNow != null ? formatCurrency(amountDueNow) : undefined}
              />
            </div>
          )}

          {/* SAME_DAY rentals never reach BOOKED with a pending handover —
              they go straight from PENDING_PAYMENT to ACTIVE on their single
              payment confirming — so this panel only ever shows for
              ADVANCE bookings. */}
          {!isSameDay && rental.status === "BOOKED" && !rental.handoverOrderId && (
            <ConfirmHandoverForm rentalId={rental.id} />
          )}

          {!isSameDay && rental.status === "BOOKED" && rental.handoverOrderId && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">
                Handover payment created — confirm once cash is received.
              </p>
              <ConfirmCashPaymentButton
                orderId={rental.handoverOrderId}
                amountLabel={handoverTotal != null ? formatCurrency(handoverTotal) : undefined}
              />
            </div>
          )}

          {canMarkReturned && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">Mark the dress as returned.</p>
              <MarkReturnedForm rentalId={rental.id} />
            </div>
          )}

          {rental.status === "RETURNED" && (
            <div className="space-y-1 text-sm text-foreground">
              <p>Returned {rental.returnDate}.</p>
              {rental.damageCost != null && rental.damageCost > 0 && (
                <p>Damage cost: {formatCurrency(rental.damageCost)}</p>
              )}
              {rental.lateFeeAmount != null && rental.lateFeeAmount > 0 && (
                <p>Late fee: {formatCurrency(rental.lateFeeAmount)}</p>
              )}
              {rental.refundAmount != null && <p>Refunded: {formatCurrency(rental.refundAmount)}</p>}
              {rental.amountOwedByCustomer != null && rental.amountOwedByCustomer > 0 && (
                <p className="font-medium text-status-cancelled">
                  Customer owes: {formatCurrency(rental.amountOwedByCustomer)}
                </p>
              )}
            </div>
          )}

          {rental.status === "CANCELLED" && (
            <p className="text-sm text-muted-foreground">This rental booking was cancelled.</p>
          )}
        </div>

        {canCancel && (
          <div className="pt-1">
            <CancelRentalButton rentalId={rental.id} />
          </div>
        )}

        <RentalNotesForm rentalId={rental.id} initialNotes={rental.notes} />

        {rental.userId && (
          <RentalMeasurementForm customerId={rental.userId} measurements={measurements} />
        )}
      </div>
    </div>
  );
}