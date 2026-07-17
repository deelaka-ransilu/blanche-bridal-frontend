import { getCustomers } from "@/lib/api/customers";
import { getEmployees } from "@/lib/api/employees";
import { redirectIfAuthError } from "@/lib/api/guards";
import { CustomerStatusButton } from "@/components/customers/customer-status-button";
import { EmployeeStatusButton } from "@/components/employees/employee-status-button";
import { NewCustomerTrigger } from "@/components/customers/new-customer-trigger";
import { NewEmployeeTrigger } from "@/components/employees/new-employee-trigger";
import { AdminUsersTabs } from "@/components/admin/admin-users-tabs";
import { ClickableUserRow, StopRowClick } from "@/components/admin/clickable-user-row";

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        active
          ? "bg-status-completed/10 text-status-completed"
          : "bg-status-cancelled/10 text-status-cancelled"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

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
          <ClickableUserRow key={cust.id} href={`/admin/customers/${cust.id}`}>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">
                {cust.firstName} {cust.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {cust.email}
                {cust.phone ? ` · ${cust.phone}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusPill active={cust.active} />
              <StopRowClick>
                <CustomerStatusButton customerId={cust.id} active={cust.active} />
              </StopRowClick>
            </div>
          </ClickableUserRow>
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
          <ClickableUserRow key={emp.id} href={`/admin/employees/${emp.id}`}>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">
                {emp.firstName} {emp.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {emp.email}
                {emp.phone ? ` · ${emp.phone}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusPill active={emp.active} />
              <StopRowClick>
                <EmployeeStatusButton employeeId={emp.id} active={emp.active} />
              </StopRowClick>
            </div>
          </ClickableUserRow>
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