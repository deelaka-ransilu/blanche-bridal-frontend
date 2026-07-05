import { getEmployees } from "@/lib/api/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import { deactivateEmployeeAction, activateEmployeeAction } from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";

export default async function AdminEmployeesPage() {
  const result = await getEmployees();
  const employees = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Employees</h1>

      <EmployeeForm />

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

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
              <span className={`text-xs ${emp.active ? "text-status-completed" : "text-status-cancelled"}`}>
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
}