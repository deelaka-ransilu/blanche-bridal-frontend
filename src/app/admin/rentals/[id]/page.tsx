import { getRentalById } from "@/lib/api/catalog/rentals";
import { getReceiptByRentalId } from "@/lib/api/orders/receipts";
import { notFound } from "next/navigation";
import { AdminRentalDetail } from "@/components/rentals/admin-rental-detail";
import { getCustomerDetailAction } from "@/lib/actions/people/customers";
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

  // Refund/settlement receipt only exists once the rental has actually been
  // returned (RentalServiceImpl.markReturned generates it synchronously in
  // the same transaction) — no point calling the endpoint before that, it
  // would just 404 as ResourceNotFoundException every time.
  const refundReceiptResult =
    rental.status === "RETURNED" ? await getReceiptByRentalId(rental.id) : null;
  const refundReceipt =
    refundReceiptResult && refundReceiptResult.success ? refundReceiptResult.data : null;

  return (
    <AdminRentalDetail
      rental={rental}
      measurements={measurements}
      refundReceipt={refundReceipt}
    />
  );
}