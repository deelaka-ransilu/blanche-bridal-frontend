import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCustomerDetail } from "@/lib/api/people/customers";
import { redirectIfAuthError } from "@/lib/api/guards";
import { CustomerStatusButton } from "@/components/customers/customer-status-button";
import { CustomerDetailView } from "@/components/customers/customer-detail-view";

// Only allow returnTo to point back into /admin — never redirect
// off-site based on a query param an admin could tamper with.
function safeReturnTo(returnTo: string | undefined): string | null {
  if (!returnTo) return null;
  if (!returnTo.startsWith("/admin/")) return null;
  return returnTo;
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const result = await getCustomerDetail(id);
  redirectIfAuthError(result);

  if (!result.success) {
    notFound();
  }

  const customer = result.data;
  const backHref = safeReturnTo(returnTo) ?? "/admin/users";
  const backLabel = safeReturnTo(returnTo) ? "Back" : "Back to users";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
           {customer.phone && !customer.phone.startsWith("google_") ? ` · ${customer.phone}` : ""}
         </p>
        </div>
        <CustomerStatusButton customerId={customer.id} active={customer.active} />
      </div>

      <CustomerDetailView customer={customer} />
    </div>
  );
}