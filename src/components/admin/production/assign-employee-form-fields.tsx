"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import type { ProductionActionState } from "@/lib/actions/production/production";
import type { AdminUser } from "@/types/user";

const initialState: ProductionActionState = null;

export function AssignEmployeeFormFields({
  action,
  employees,
  employeesLoadError,
  currentEmployeeId,
}: {
  // Bound with orderId + customDesignRequestId already applied at the call
  // site — same pattern as the other production forms.
  action: (prevState: ProductionActionState, formData: FormData) => Promise<ProductionActionState>;
  employees: AdminUser[];
  employeesLoadError?: string;
  currentEmployeeId?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const canSubmit = !employeesLoadError && employees.length > 0;

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      {employeesLoadError && (
        <p className="text-xs text-destructive">
          Couldn&apos;t load employees: {employeesLoadError}
        </p>
      )}
      <select
        name="employeeId"
        defaultValue={currentEmployeeId ?? ""}
        disabled={!canSubmit || isPending}
        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
      >
        <option value="" disabled>
          {!employeesLoadError && employees.length === 0
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
        disabled={!canSubmit || isPending}
        className="rounded-lg border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Saving…" : currentEmployeeId ? "Reassign employee" : "Assign employee"}
      </button>

      {state && !state.success && (
        <p className="flex items-center gap-1.5 text-[11px] text-status-cancelled">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {state.message || "Could not assign the employee. Try again."}
        </p>
      )}
    </form>
  );
}