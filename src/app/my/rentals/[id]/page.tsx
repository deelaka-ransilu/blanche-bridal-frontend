import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRentalById } from "@/lib/api/rentals";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import type { RentalStatus } from "@/types/rental";
import { formatDate } from "@/lib/utils";
import { RentalTracker } from "@/components/rentals/rental-tracker";
import { CancelRentalButton } from "@/components/rentals/cancel-rental-button";
import { FittingAppointmentCard } from "@/components/rentals/fitting-appointment-card";

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={danger ? "font-medium text-status-cancelled" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function toBadgeStatus(status: RentalStatus): Status {
  switch (status) {
    case "PENDING_PAYMENT":
      return "pending";
    case "BOOKED":
      return "progress";
    case "ACTIVE":
      return "progress";
    case "OVERDUE":
      return "cancelled";
    case "RETURNED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

function statusLabel(status: RentalStatus): string {
  switch (status) {
    case "PENDING_PAYMENT": return "Pending Payment";
    case "BOOKED": return "Booked";
    case "ACTIVE": return "Active";
    case "OVERDUE": return "Overdue";
    case "RETURNED": return "Returned";
    case "CANCELLED": return "Cancelled";
  }
}

export default async function MyRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRentalById(id);

  if (!result.success) notFound();

  const rental = result.data;
  const canCancel = rental.status === "PENDING_PAYMENT" || rental.status === "BOOKED";

  return (
    <>
      <Link
        href="/my/rentals"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Rentals
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">
            {rental.productName}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Booked {formatDate(rental.createdAt)}
          </p>
        </div>
        <StatusBadge status={toBadgeStatus(rental.status)}>
          {statusLabel(rental.status)}
        </StatusBadge>
      </div>

      <div className="flex flex-col gap-4">
        <RentalTracker rental={rental} />

        {rental.fittingDate && rental.fittingTimeSlot && (
          <FittingAppointmentCard date={rental.fittingDate} timeSlot={rental.fittingTimeSlot} />
        )}

        {rental.status === "BOOKED" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              Pick up your dress on{" "}
              <span className="font-medium">{formatDate(rental.rentalStart)}</span> — no
              appointment needed, just come by any time that day. The remaining
              balance and a refundable security deposit are due at pickup.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            Rental details
          </p>
          <DetailRow label="Rental start" value={formatDate(rental.rentalStart)} />
          <DetailRow label="Rental end" value={formatDate(rental.rentalEnd)} />
          {rental.fittingDate && (
            <DetailRow label="Fitting date" value={formatDate(rental.fittingDate)} />
          )}
          {rental.fittingTimeSlot && (
            <DetailRow label="Fitting time" value={rental.fittingTimeSlot} />
          )}
          {rental.returnDate && (
            <DetailRow label="Returned on" value={formatDate(rental.returnDate)} />
          )}
          {rental.notes && <DetailRow label="Notes" value={rental.notes} />}
        </div>

        {rental.status === "RETURNED" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-heading mb-3 text-sm font-medium text-foreground">
              Return summary
            </p>
            {rental.damageCost != null && rental.damageCost > 0 && (
              <DetailRow
                label="Damage cost"
                value={`Rs ${rental.damageCost.toLocaleString("en-LK")}`}
                danger
              />
            )}
            {rental.lateFeeAmount != null && rental.lateFeeAmount > 0 && (
              <DetailRow
                label="Late fee"
                value={`Rs ${rental.lateFeeAmount.toLocaleString("en-LK")}`}
                danger
              />
            )}
            {rental.securityDepositRefundedAmount != null && (
              <DetailRow
                label="Security deposit refunded"
                value={`Rs ${rental.securityDepositRefundedAmount.toLocaleString("en-LK")}`}
              />
            )}
            {rental.amountOwedByCustomer != null && rental.amountOwedByCustomer > 0 && (
              <DetailRow
                label="Amount owed"
                value={`Rs ${rental.amountOwedByCustomer.toLocaleString("en-LK")}`}
                danger
              /> 
            )}
          </div>
        )}

        {canCancel && (
          <div className="pt-1">
            <CancelRentalButton rentalId={rental.id} />
          </div>
        )}
      </div>
    </>
  );
}