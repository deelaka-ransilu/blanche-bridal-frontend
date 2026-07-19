import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCustomerDetail } from "@/lib/api/customers";
import { redirectIfAuthError } from "@/lib/api/guards";
import { CustomerStatusButton } from "@/components/customers/customer-status-button";
import { CustomerDetailView } from "@/components/customers/customer-detail-view";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCustomerDetail(id);
  redirectIfAuthError(result);

  if (!result.success) {
    notFound();
  }

  const customer = result.data;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to users
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-border p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-xl font-medium text-foreground">
              {customer.firstName} {customer.lastName}
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                customer.active
                  ? "bg-status-completed/10 text-status-completed"
                  : "bg-status-cancelled/10 text-status-cancelled"
              }`}
            >
              {customer.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {customer.email}
            {customer.phone ? ` · ${customer.phone}` : ""}
          </p>
        </div>
        <CustomerStatusButton customerId={customer.id} active={customer.active} />
      </div>

      <CustomerDetailView customer={customer} />
    </div>
  );
}