"use client";

import { useActionState, useState } from "react";
import { createOrderAction, type CreateOrderState } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/types/product";
import type { AdminUser } from "@/types/user";
import type { OrderItemRequest, DiscountType } from "@/types/order";

const initialState: CreateOrderState = null;

type ItemRow = OrderItemRequest & { key: string };

function emptyRow(): ItemRow {
  return { key: crypto.randomUUID(), productId: "", quantity: 1, size: "" };
}

export function CreateOrderForm({
  products,
  customers,
}: {
  products: Product[];
  customers: AdminUser[];
}) {
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [discountType, setDiscountType] = useState<DiscountType | "">("");

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  // Serialized without the client-only `key`, matching OrderItemRequest exactly.
  const itemsJson = JSON.stringify(
    rows
      .filter((r) => r.productId)
      .map(({ productId, quantity, size }) => ({
        productId,
        quantity,
        ...(size ? { size } : {}),
      })),
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border p-4">
      <h2 className="font-heading text-lg font-medium text-foreground">New Order</h2>

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

      <input type="hidden" name="itemsJson" value={itemsJson} />

      {/* ── Items ─────────────────────────────────────────────────────── */}
      <div>
        <Label>Items</Label>
        <div className="mt-2 space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_90px_100px_auto] items-end gap-2">
              <div>
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(row.key, { productId: e.target.value })}
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
              </div>
              <div>
                <Input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Input
                  placeholder="Size"
                  value={row.size}
                  onChange={(e) => updateRow(row.key, { size: e.target.value })}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeRow(row.key)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
          + Add item
        </Button>
        {products.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">No products found.</p>
        )}
      </div>

      {/* ── Customer & fulfillment ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerId">Customer</Label>
          <select
            id="customerId"
            name="customerId"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
          {state?.fields?.customerId && (
            <p className="mt-1 text-xs text-destructive">{state.fields.customerId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="orderMode">Order Mode</Label>
          <select
            id="orderMode"
            name="orderMode"
            defaultValue="WALK_IN"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="WALK_IN">Walk-in</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEBSITE">Website</option>
          </select>
        </div>

        <div>
          <Label htmlFor="fulfillmentMethod">Fulfillment</Label>
          <select
            id="fulfillmentMethod"
            name="fulfillmentMethod"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="PICKUP">Pickup</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue="CASH"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="PAYHERE">PayHere</option>
          </select>
        </div>

        <div>
          <Label htmlFor="deliveryAddress">Delivery Address</Label>
          <Input id="deliveryAddress" name="deliveryAddress" />
        </div>
        <div>
          <Label htmlFor="customerPhone">Customer Phone</Label>
          <Input id="customerPhone" name="customerPhone" />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>

      {/* ── Discount (staff-only — this form only renders on admin/employee routes) ── */}
      <div className="rounded-lg border border-border p-3">
        <Label>Discount (optional)</Label>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <select
              name="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType | "")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No discount</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </select>
          </div>
          <div>
            <Input
              name="discountValue"
              type="number"
              step="0.01"
              placeholder={discountType === "PERCENTAGE" ? "e.g. 10 (%)" : "e.g. 2000 (Rs)"}
              disabled={!discountType}
            />
            {state?.fields?.discountValid && (
              <p className="mt-1 text-xs text-destructive">{state.fields.discountValid}</p>
            )}
          </div>
          <div>
            <Input name="discountReason" placeholder="Reason" disabled={!discountType} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Order"}
      </Button>
    </form>
  );
}