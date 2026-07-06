import Link from "next/link";
import { getMyRentals } from "@/lib/api/rentals";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import type { RentalStatus } from "@/types/rental";
import { formatDate } from "@/lib/utils";

function toBadgeStatus(status: RentalStatus): Status {
  switch (status) {
    case "ACTIVE":
      return "progress";
    case "OVERDUE":
      return "cancelled";
    case "RETURNED":
      return "completed";
  }
}

function statusLabel(status: RentalStatus): string {
  switch (status) {
    case "ACTIVE": return "Active";
    case "OVERDUE": return "Overdue";
    case "RETURNED": return "Returned";
  }
}

export default async function MyRentalsPage() {
  const result = await getMyRentals();

  if (!result.success) {
    return (
      <>
        <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
          My rentals
        </h1>
        <p className="text-sm text-status-cancelled">
          Couldn&apos;t load your rentals: {result.message}
        </p>
      </>
    );
  }

  const rentals = result.data;

  return (
    <>
      <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
        My rentals
      </h1>

      <div className="flex flex-col gap-2.5">
        {rentals.map((rental) => (
          <Link
            key={rental.id}
            href={`/my/rentals/${rental.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5"
          >
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                {rental.productName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(rental.rentalStart)} → {formatDate(rental.rentalEnd)}
              </p>
            </div>
            <StatusBadge status={toBadgeStatus(rental.status)}>
              {statusLabel(rental.status)}
            </StatusBadge>
          </Link>
        ))}
        {rentals.length === 0 && (
          <p className="text-sm text-muted-foreground">You have no rentals yet.</p>
        )}
      </div>
    </>
  );
}