"use client";

import { useActionState } from "react";
import { createWalkInCustomerAction, type WalkInCustomerFormState } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { PersonFormFields } from "@/components/shared/person-form-fields";
import { FormStatusMessage } from "@/components/shared/form-status-message";
import { useFormSuccess } from "@/lib/hooks/use-form-success";

export function WalkInCustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState<WalkInCustomerFormState, FormData>(
    createWalkInCustomerAction,
    null,
  );

  useFormSuccess(state, onSuccess);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PersonFormFields />
      </div>

      <FormStatusMessage state={state} />

      <Button type="submit" className="w-full">
        Add Walk-in Customer
      </Button>
    </form>
  );
}