"use client";

import { useActionState, useEffect } from "react";
import { createWalkInCustomerAction, type WalkInCustomerFormState } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export function WalkInCustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState<WalkInCustomerFormState, FormData>(
    createWalkInCustomerAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          name="firstName"
          placeholder="First name"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          name="lastName"
          placeholder="Last name"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {state && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}

      <Button type="submit" className="w-full">
        Add Walk-in Customer
      </Button>
    </form>
  );
}