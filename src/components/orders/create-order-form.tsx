"use client";

import { useActionState, useState } from "react";
import { createOrderAction, type CreateOrderState } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
    <form action={formAction} className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading mb-5 text-lg font-medium text-foreground">New order</h2>

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

      <input type="hidden" name="itemsJson" value={itemsJson} />

      {/* ── Section: Items ────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Items
        </p>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_90px_100px_auto] items-end gap-2">
              <div>
                <Select
                  value={row.productId}
                  onChange={(e) => updateRow(row.key, { productId: e.target.value })}
                  required
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.category?.name ?? "Uncategorized"}
                    </option>
                  ))}
                </Select>
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

      {/* ── Section: Customer & fulfillment ─────────────────────────────── */}
      <div className="mb-6 border-t border-border pt-5">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Customer & fulfillment
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">Customer</Label>
            <Select id="customerId" name="customerId" className="mt-1">
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </Select>
            {state?.fields?.customerId && (
              <p className="mt-1 text-xs text-destructive">{state.fields.customerId}</p>
            )}
          </div>

          <div>
            <Label htmlFor="orderMode">Order mode</Label>
            <Select id="orderMode" name="orderMode" defaultValue="WALK_IN" className="mt-1">
              <option value="WALK_IN">Walk-in</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="WEBSITE">Website</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="fulfillmentMethod">Fulfillment</Label>
            <Select id="fulfillmentMethod" name="fulfillmentMethod" className="mt-1">
              <option value="">—</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select id="paymentMethod" name="paymentMethod" defaultValue="CASH" className="mt-1">
              <option value="CASH">Cash</option>
              <option value="PAYHERE">PayHere</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="deliveryAddress">Delivery address</Label>
            <Input id="deliveryAddress" name="deliveryAddress" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="customerPhone">Customer phone</Label>
            <Input id="customerPhone" name="customerPhone" className="mt-1" />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" className="mt-1" />
        </div>
      </div>

      {/* ── Section: Discount (staff-only) ──────────────────────────────── */}
      <div className="mb-6 border-t border-border pt-5">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Discount (optional)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <Select
            name="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType | "")}
          >
            <option value="">No discount</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </Select>
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
          <Input name="discountReason" placeholder="Reason" disabled={!discountType} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Creating…" : "Create order"}
      </Button>
    </form>
  );
}