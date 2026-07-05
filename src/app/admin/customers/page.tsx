import { getCustomers } from "@/lib/api/customers";
import { deactivateCustomerAction, activateCustomerAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export default async function AdminCustomersPage() {
  const result = await getCustomers();
  const customers = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Customers</h1>

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

      <div className="space-y-2">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">
                {cust.firstName} {cust.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {cust.email}
                {cust.phone ? ` · ${cust.phone}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${cust.active ? "text-status-completed" : "text-status-cancelled"}`}
              >
                {cust.active ? "Active" : "Inactive"}
              </span>
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
      <p className="text-xs text-muted-foreground">
        Customer detail view, profile notes, and measurements are deferred to a separate session.
      </p>
    </div>
  );
}