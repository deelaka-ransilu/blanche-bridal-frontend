import Link from "next/link";
import { getCustomers } from "@/lib/api/customers";
import { getEmployees } from "@/lib/api/employees";
import { redirectIfAuthError } from "@/lib/api/guards";
import { Button } from "@/components/ui/button";
import { CustomerStatusButton } from "@/components/customers/customer-status-button";
import { NewCustomerTrigger } from "@/components/customers/new-customer-trigger";
import { NewEmployeeTrigger } from "@/components/employees/new-employee-trigger";
import { deactivateEmployeeAction, activateEmployeeAction } from "@/lib/actions/employees";
import { AdminUsersTabs } from "@/components/admin/admin-users-tabs";

export default async function AdminUsersPage() {
  const customersResult = await getCustomers();
  redirectIfAuthError(customersResult);

  const employeesResult = await getEmployees();

  const customers = customersResult.success ? customersResult.data : [];
  const employees = employeesResult.success ? employeesResult.data : [];

  const customersContent = (
    <div className="space-y-5">
      {!customersResult.success && (
        <p className="text-sm text-destructive">{customersResult.message}</p>
      )}

      <div className="space-y-2">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
          >
            <Link href={`/admin/customers/${cust.id}`} className="min-w-0 flex-1">
              <p className="font-medium text-foreground hover:underline">
                {cust.firstName} {cust.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {cust.email}
                {cust.phone ? ` · ${cust.phone}` : ""}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
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
              <CustomerStatusButton customerId={cust.id} active={cust.active} />
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        )}
      </div>
    </div>
  );

  const employeesContent = (
    <div className="space-y-5">
      {!employeesResult.success && (
        <p className="text-sm text-destructive">{employeesResult.message}</p>
      )}

      <div className="space-y-2">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">
                {emp.firstName} {emp.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {emp.email}
                {emp.phone ? ` · ${emp.phone}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${emp.active ? "text-status-completed" : "text-status-cancelled"}`}
              >
                {emp.active ? "Active" : "Inactive"}
              </span>
              {emp.active ? (
                <form action={deactivateEmployeeAction.bind(null, emp.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Deactivate
                  </Button>
                </form>
              ) : (
                <form action={activateEmployeeAction.bind(null, emp.id)}>
                  <Button type="submit" size="sm">
                    Activate
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <p className="text-sm text-muted-foreground">No employees yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <AdminUsersTabs
      customersCount={customers.length}
      employeesCount={employees.length}
      customersContent={customersContent}
      employeesContent={employeesContent}
      customerTrigger={<NewCustomerTrigger />}
      employeeTrigger={<NewEmployeeTrigger />}
    />
  );
}