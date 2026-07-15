import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRentalById } from "@/lib/api/rentals";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import type { RentalStatus } from "@/types/rental";
import { formatDate } from "@/lib/utils";
import { RentalTracker } from "@/components/rentals/rental-tracker";

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

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            Rental details
          </p>
          <DetailRow label="Rental start" value={formatDate(rental.rentalStart)} />
          <DetailRow label="Rental end" value={formatDate(rental.rentalEnd)} />
          {rental.returnDate && (
            <DetailRow label="Returned on" value={formatDate(rental.returnDate)} />
          )}
          {rental.notes && <DetailRow label="Notes" value={rental.notes} />}
        </div>
      </div>
    </>
  );
}