"use client";

import { useActionState } from "react";
import { createRentalAction, type CreateRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Product } from "@/types/product";
import type { AdminUser } from "@/types/user";

const initialState: CreateRentalState = null;

export function CreateRentalForm({
  products,
  customers,
}: {
  products: Product[];
  customers: AdminUser[];
}) {
  const [state, formAction, isPending] = useActionState(createRentalAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading mb-5 text-lg font-medium text-foreground">New rental</h2>

      {state && !state.success && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      )}
      {state?.success && (
        <div className="mb-4 rounded-md border border-status-completed/30 bg-status-completed/10 px-3 py-2 text-sm text-status-completed">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productId">Product</Label>
          <Select id="productId" name="productId" required className="mt-1">
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.category?.name ?? "Uncategorized"}
              </option>
            ))}
          </Select>
          {products.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">No available products found.</p>
          )}
          {state?.fields?.productId && (
            <p className="mt-1 text-xs text-destructive">{state.fields.productId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="userId">Customer</Label>
          <Select id="userId" name="userId" required className="mt-1">
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </Select>
          {state?.fields?.userId && (
            <p className="mt-1 text-xs text-destructive">{state.fields.userId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rentalStart">Start date</Label>
          <Input id="rentalStart" name="rentalStart" type="date" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="rentalEnd">End date</Label>
          <Input id="rentalEnd" name="rentalEnd" type="date" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="depositAmount">Deposit amount</Label>
          <Input id="depositAmount" name="depositAmount" type="number" step="0.01" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="orderId">Order ID (optional)</Label>
          <Input id="orderId" name="orderId" className="mt-1" />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" className="mt-1" />
      </div>

      <Button type="submit" disabled={isPending} className="mt-5 w-full sm:w-auto">
        {isPending ? "Creating…" : "Create rental"}
      </Button>
    </form>
  );
}