import { getAllRentals } from "@/lib/api/rentals";
import { getAvailableProducts } from "@/lib/api/products";
import { getCustomers } from "@/lib/api/customers";
import { CreateRentalForm } from "@/components/rentals/create-rental-form";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { markReturnedAction } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import type { RentalStatus } from "@/types/rental";

const RENTAL_STATUS_MAP: Record<RentalStatus, Status> = {
  ACTIVE: "progress",
  OVERDUE: "cancelled",
  RETURNED: "completed",
};

export default async function AdminRentalsPage() {
  const [rentalsResult, productsResult, customersResult] = await Promise.all([
    getAllRentals(),
    getAvailableProducts(),
    getCustomers(),
  ]);

  const rentals = rentalsResult.success ? rentalsResult.data : [];
  const products = productsResult.success ? productsResult.data : [];
  const customers = customersResult.success ? customersResult.data : []; // ← was passing customersResult directly before

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Rentals</h1>

      <CreateRentalForm products={products} customers={customers} />

      {!rentalsResult.success && (
        <p className="text-sm text-destructive">{rentalsResult.message}</p>
      )}
      {!productsResult.success && (
        <p className="text-sm text-destructive">
          Failed to load products: {productsResult.message}
        </p>
      )}
      {!customersResult.success && (
        <p className="text-sm text-destructive">
          Failed to load customers: {customersResult.message}
        </p>
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
                {rental.status}
              </StatusBadge>
              {rental.status !== "RETURNED" && (
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