import { getEmployees } from "@/lib/api/employees";
import { assignEmployeeAction } from "@/lib/actions/production";

export async function AssignEmployeeForm({ orderId }: { orderId: string }) {
  const result = await getEmployees();
  const employees = result.success ? result.data : [];
  const action = assignEmployeeAction.bind(null, orderId);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      {!result.success && (
        <p className="text-xs text-destructive">
          Couldn&apos;t load employees: {result.message}
        </p>
      )}
      <select
        name="employeeId"
        defaultValue=""
        disabled={!result.success || employees.length === 0}
        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
      >
        <option value="" disabled>
          {result.success && employees.length === 0
            ? "No employees available"
            : "Select an employee"}
        </option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.firstName} {e.lastName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!result.success || employees.length === 0}
        className="rounded-lg border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
      >
        Assign employee
      </button>
    </form>
  );
}