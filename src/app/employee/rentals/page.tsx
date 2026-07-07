import { getAllRentals } from "@/lib/api/rentals";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { markReturnedAction } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import type { RentalStatus } from "@/types/rental";

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

function canMarkReturned(status: RentalStatus): boolean {
  return status === "ACTIVE" || status === "OVERDUE";
}

// Employee scope is intentionally list + mark-returned only, no create.
// AdminController's customer-list endpoint (/api/admin/customers) is
// ADMIN-only, so there's no way for an employee to populate a customer
// picker for CreateRentalForm -- see FRONTEND_HANDOVER_V2.md.

export default async function EmployeeRentalsPage() {
  const rentalsResult = await getAllRentals();
  const rentals = rentalsResult.success ? rentalsResult.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Rentals</h1>

      {!rentalsResult.success && (
        <p className="text-sm text-destructive">{rentalsResult.message}</p>
      )}

      <div className="space-y-2">
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">{rental.productName}</p>
              <p className="text-sm text-muted-foreground">
                {rental.customerName} · {rental.rentalStart} → {rental.rentalEnd}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={RENTAL_STATUS_MAP[rental.status]}>
                {RENTAL_STATUS_LABEL[rental.status]}
              </StatusBadge>
              {canMarkReturned(rental.status) && (
                <form action={markReturnedAction.bind(null, rental.id)}>
                  <input
                    type="date"
                    name="returnDate"
                    required
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                  <Button type="submit" size="sm">
                    Mark Returned
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {rentals.length === 0 && (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        )}
      </div>
    </div>
  );
}