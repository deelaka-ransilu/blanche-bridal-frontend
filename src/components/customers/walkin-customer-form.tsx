"use client";

import { useActionState } from "react";
import { createWalkInCustomerAction, type WalkInCustomerFormState } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export function WalkInCustomerForm() {
  const [state, formAction] = useActionState<WalkInCustomerFormState, FormData>(
    createWalkInCustomerAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          name="firstName"
          placeholder="First name"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          name="lastName"
          placeholder="Last name"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit">Add Walk-in Customer</Button>
      {state && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}
    </form>
  );
}