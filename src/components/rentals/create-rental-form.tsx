"use client";

import { useActionState } from "react";
import { createRentalAction, type CreateRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <form action={formAction} className="space-y-4 rounded-xl border border-border p-4">
      <h2 className="font-heading text-lg font-medium text-foreground">New Rental</h2>

      {state && !state.success && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productId">Product</Label>
          <select
            id="productId"
            name="productId"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
            <option key={p.id} value={p.id}>
                {p.name} — {p.category?.name ?? "Uncategorized"}
            </option>
            ))}
          </select>
          {products.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              No available products found.
            </p>
          )}
          {state?.fields?.productId && (
            <p className="mt-1 text-xs text-destructive">{state.fields.productId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="userId">Customer</Label>
          <select
            id="userId"
            name="userId"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
          {state?.fields?.userId && (
            <p className="mt-1 text-xs text-destructive">{state.fields.userId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rentalStart">Start Date</Label>
          <Input id="rentalStart" name="rentalStart" type="date" required />
        </div>
        <div>
          <Label htmlFor="rentalEnd">End Date</Label>
          <Input id="rentalEnd" name="rentalEnd" type="date" required />
        </div>
        <div>
          <Label htmlFor="depositAmount">Deposit Amount</Label>
          <Input id="depositAmount" name="depositAmount" type="number" step="0.01" />
        </div>
        <div>
          <Label htmlFor="orderId">Order ID (optional)</Label>
          <Input id="orderId" name="orderId" />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Rental"}
      </Button>
    </form>
  );
}