import { getRentalById } from "@/lib/api/rentals";
import { notFound } from "next/navigation";
import { AdminRentalDetail } from "@/components/rentals/admin-rental-detail";
import { getCustomerDetailAction } from "@/lib/actions/customers";
import type { CustomerMeasurement } from "@/types/customer";

export default async function AdminRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRentalById(id);

  if (!result.success) {
    if (result.message?.toLowerCase().includes("not found")) {
      notFound();
    }
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Couldn&apos;t load this rental: {result.message}
      </div>
    );
  }

  const rental = result.data;

  // rental.userId is typed nullable on Rental — fetch measurements only when
  // there's actually a linked user; AdminRentalDetail hides the panel when
  // customerId is null rather than assuming this can't happen.
  let measurements: CustomerMeasurement[] = [];
  if (rental.userId) {
    const customerResult = await getCustomerDetailAction(rental.userId);
    if (customerResult.success) {
      measurements = customerResult.data.measurements;
    }
  }

  return <AdminRentalDetail rental={rental} measurements={measurements} />;
}