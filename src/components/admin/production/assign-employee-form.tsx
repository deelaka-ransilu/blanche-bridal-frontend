import { getEmployees } from "@/lib/api/employees";
import { assignEmployeeAction } from "@/lib/actions/production";
import { AssignEmployeeFormFields } from "@/components/admin/production/assign-employee-form-fields";

type AssignEmployeeFormProps = {
  orderId: string;
  customDesignRequestId: string;
  currentEmployeeId?: string | null;
};

export async function AssignEmployeeForm({
  orderId,
  customDesignRequestId,
  currentEmployeeId,
}: AssignEmployeeFormProps) {
  // Data fetching stays server-side (unchanged) — only the interactive
  // form itself moved into a client child so it can use useActionState
  // for inline error surfacing, which a Server Component can't do.
  const result = await getEmployees();
  const employees = result.success ? result.data : [];
  const action = assignEmployeeAction.bind(null, orderId, customDesignRequestId);

  return (
    <AssignEmployeeFormFields
      action={action}
      employees={employees}
      employeesLoadError={result.success ? undefined : result.message}
      currentEmployeeId={currentEmployeeId}
    />
  );
}