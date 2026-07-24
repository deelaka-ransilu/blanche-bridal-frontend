"use client";

import { useActionState } from "react";
import { createEmployeeAction, type EmployeeFormState } from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";
import { PersonFormFields } from "@/components/shared/person-form-fields";
import { FormStatusMessage } from "@/components/shared/form-status-message";
import { useFormSuccess } from "@/lib/hooks/use-form-success";

export function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState<EmployeeFormState, FormData>(
    createEmployeeAction,
    null,
  );

  useFormSuccess(state, onSuccess);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PersonFormFields>
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </PersonFormFields>
      </div>

      <FormStatusMessage state={state} />

      <Button type="submit" className="w-full">
        Add Employee
      </Button>
    </form>
  );
}