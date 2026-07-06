import { getCustomerDetail } from "@/lib/api/customers";
import { notFound } from "next/navigation";
import CustomerProfileForm from "@/components/customers/customer-profile-form";
import MeasurementForm from "@/components/customers/measurement-form";
import MeasurementList from "@/components/customers/measurement-list";
import { redirectIfAuthError } from "@/lib/api/guards";
import { formatDate } from "@/lib/utils";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCustomerDetail(id);

  redirectIfAuthError(result);

  if (!result.success || !result.data) {
    notFound();
  }

  const customer = result.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-sm text-gray-500">{customer.email} · {customer.phone}</p>
        <p className="text-xs text-gray-400">
          Customer since {formatDate(customer.createdAt)} ·{" "}
          {customer.active ? "Active" : "Inactive"}
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-2">Profile Notes</h2>
        <CustomerProfileForm
          customerId={customer.id}
          initialNotes={customer.adminNotes ?? ""}
          initialImageUrls={customer.designImageUrls}
        />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-2">
          Measurements ({customer.measurements.length})
        </h2>
        <MeasurementList customerId={customer.id} measurements={customer.measurements} />
        <details className="mt-3">
          <summary className="text-xs text-rose-600 cursor-pointer">+ Add new measurement set</summary>
          <MeasurementForm customerId={customer.id} mode="add" />
        </details>
      </section>
    </div>
  );
}