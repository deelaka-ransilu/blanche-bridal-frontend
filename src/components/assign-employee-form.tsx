import { getEmployees } from "@/lib/api/employees";
import { assignEmployeeAction } from "@/lib/actions/production";

export async function AssignEmployeeForm({ orderId }: { orderId: string }) {
  const employees = await getEmployees();
  const action = assignEmployeeAction.bind(null, orderId);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <select
        name="employeeId"
        defaultValue=""
        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
      >
        <option value="" disabled>Select an employee</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.firstName} {e.lastName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted"
      >
        Assign employee
      </button>
    </form>
  );
}