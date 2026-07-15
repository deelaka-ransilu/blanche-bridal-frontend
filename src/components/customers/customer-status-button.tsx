"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  deactivateCustomerAction,
  activateCustomerAction,
  type CustomerActionState,
} from "@/lib/actions/customers";

export function CustomerStatusButton({ customerId, active }: { customerId: string; active: boolean }) {
  const action = active ? deactivateCustomerAction : activateCustomerAction;
  const [state, formAction] = useActionState<CustomerActionState, FormData>(
    action.bind(null, customerId),
    null,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <Button type="submit" size="sm" variant={active ? "outline" : "default"}>
          {active ? "Deactivate" : "Activate"}
        </Button>
      </form>
      {state && !state.success && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
    </div>
  );
}