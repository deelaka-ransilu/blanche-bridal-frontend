import Link from "next/link";
import { getCustomers } from "@/lib/api/customers";
import { deactivateCustomerAction, activateCustomerAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  const result = await getCustomers();
  if (!result.success && result.message === "Token expired") {
  redirect("/login");
}
  const customers = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Customers</h1>

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

      <div className="space-y-2">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary/40 transition-colors"
          >
            <Link
              href={`/admin/customers/${cust.id}`}
              className="flex-1 min-w-0"
            >
              <p className="font-medium text-foreground hover:underline">
                {cust.firstName} {cust.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {cust.email}
                {cust.phone ? ` · ${cust.phone}` : ""}
              </p>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs ${cust.active ? "text-status-completed" : "text-status-cancelled"}`}
              >
                {cust.active ? "Active" : "Inactive"}
              </span>
              <Link href={`/admin/customers/${cust.id}`}>
                <Button type="button" size="sm" variant="outline">
                  View
                </Button>
              </Link>
              {cust.active ? (
                <form action={deactivateCustomerAction.bind(null, cust.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Deactivate
                  </Button>
                </form>
              ) : (
                <form action={activateCustomerAction.bind(null, cust.id)}>
                  <Button type="submit" size="sm">
                    Activate
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        )}
      </div>
    </div>
  );
}