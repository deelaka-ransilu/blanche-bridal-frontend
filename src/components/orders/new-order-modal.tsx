"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createOrderAction, type CreateOrderState } from "@/lib/actions/orders/orders";
import { createWalkInCustomerAction, type WalkInCustomerFormState } from "@/lib/actions/people/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Minus, Plus, Search, Check, UserPlus } from "lucide-react";
import { PRODUCT_SIZES, PRODUCT_SIZE_LABELS } from "@/types/product";
import type { Product } from "@/types/product";
import type { AdminUser } from "@/types/user";
import type { DiscountType } from "@/types/order";
import { displayCustomerContact } from "@/lib/customer-display";
import { DiscountFields } from "@/components/shared/discount-fields";
import { OrderSummaryReceipt } from "../shared/order-summary-receipt";

const initialState: CreateOrderState = null;
const initialCustomerState: WalkInCustomerFormState = null;

interface SelectedItem {
  key: string;
  product: Product;
  quantity: number;
  size: string;
}

function getPrice(p: Product): number {
  return p.purchasePrice ?? p.rentalPrice ?? 0;
}

export function NewOrderModal({
  products,
  customers,
  onClose,
}: {
  products: Product[];
  customers: AdminUser[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);

  const [items, setItems] = useState<SelectedItem[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // ── Customer picker (self-contained — no shared wizard state) ──────────
  const [customerList, setCustomerList] = useState<AdminUser[]>(customers);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [newCustomerState, newCustomerFormAction] = useActionState<WalkInCustomerFormState, FormData>(
    createWalkInCustomerAction,
    initialCustomerState,
  );

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customerList;
    return customerList.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.phone ?? ""}`.toLowerCase().includes(q),
    );
  }, [customerList, customerSearch]);

  function selectCustomer(customer: AdminUser) {
    setSelectedCustomer(customer);
    setCustomerPhone((customer as any).phone ?? "");
    setDeliveryAddress((customer as any).address ?? "");
  }

  // Newly created customer: add to list, select, drop back to search view.
  useEffect(() => {
    if (newCustomerState?.success && newCustomerState.customer) {
      setCustomerList((prev) => [newCustomerState.customer!, ...prev]);
      selectCustomer(newCustomerState.customer);
      setShowNewCustomerForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCustomerState]);

  const [fulfillmentMethod, setFulfillmentMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  const [discountType, setDiscountType] = useState<DiscountType | "">("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const subtotal = items.reduce((sum, i) => sum + i.quantity * getPrice(i.product), 0);
  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : discountType === "FIXED"
        ? Number(discountValue) || 0
        : 0;
  const total = Math.max(subtotal - discountAmount, 0);

  function toggleProduct(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.filter((i) => i.product.id !== product.id);
      return [...prev, { key: crypto.randomUUID(), product, quantity: 1, size: "" }];
    });
  }

  function updateQuantity(key: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  }

  function updateSize(key: string, size: string) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, size } : i)));
  }

  const itemsJson = JSON.stringify(
    items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      ...(i.size ? { size: i.size } : {}),
    })),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <h2 className="font-heading text-lg font-medium text-foreground">New order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          id="new-order-form"
          action={formAction}
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5"
        >
          <input type="hidden" name="itemsJson" value={itemsJson} />
          <input type="hidden" name="customerId" value={selectedCustomer?.id ?? ""} />

          {state && !state.success && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </div>
          )}

          {/* ── Customer ─────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Customer
            </p>

            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{displayCustomerContact(selectedCustomer)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Change
                </button>
              </div>
            ) : showNewCustomerForm ? (
              <form
                action={(formData) => {
                  newCustomerFormAction(formData);
                }}
                className="flex flex-col gap-3 rounded-lg border border-border p-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">New customer</p>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Search instead
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="firstName"
                    placeholder="First name"
                    required
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    name="lastName"
                    placeholder="Last name"
                    required
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <input
                  name="phone"
                  placeholder="Phone"
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />

                {newCustomerState && !newCustomerState.success && (
                  <p className="text-xs text-destructive">{newCustomerState.message}</p>
                )}

                <button
                  type="submit"
                  className="rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add customer
                </button>
              </form>
            ) : (
              <>
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewCustomerForm(true)}
                  className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  New customer
                </button>

                <div className="max-h-52 overflow-y-auto rounded-lg border border-border">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{displayCustomerContact(c)}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No matches.
                    </p>
                  )}
                </div>
              </>
            )}

            {state?.fields?.customerId && !selectedCustomer && (
              <p className="mt-1 text-xs text-destructive">{state.fields.customerId}</p>
            )}

            {selectedCustomer && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryAddress">Delivery address</Label>
                  <Input
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Product picker ───────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Items
            </p>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search dresses, jewelry…"
                className="pl-8"
              />
            </div>

            {productSearch.trim().length > 0 && (
              <div className="max-h-52 overflow-y-auto rounded-lg border border-border">
                {filteredProducts.map((p) => {
                  const isSelected = items.some((i) => i.product.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p)}
                      className={`flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left last:border-b-0 transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? "border-primary bg-primary" : "border-border"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          {p.category?.name && (
                            <p className="truncate text-xs text-muted-foreground">{p.category.name}</p>
                          )}
                        </div>
                      </div>
                      <p className="shrink-0 text-sm text-muted-foreground">
                        Rs {getPrice(p).toLocaleString("en-LK")}
                      </p>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No products found.
                  </p>
                )}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-3 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.key} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-medium text-foreground">
                        {item.product.name}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {item.product.type === "DRESS" && (
                      <div className="flex flex-wrap gap-1.5">
                        {PRODUCT_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateSize(item.key, size)}
                            className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                              item.size === size
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground"
                            }`}
                          >
                            {PRODUCT_SIZE_LABELS[size]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Fulfillment & payment ───────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Fulfillment
              </p>
              <input type="hidden" name="fulfillmentMethod" value={fulfillmentMethod} />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("PICKUP")}
                  className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                    fulfillmentMethod === "PICKUP"
                      ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("DELIVERY")}
                  className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                    fulfillmentMethod === "DELIVERY"
                      ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Payment method
              </p>
              <input type="hidden" name="paymentMethod" value={paymentMethod} />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                    paymentMethod === "CASH"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYHERE")}
                  className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                    paymentMethod === "PAYHERE"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  PayHere
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* ── Discount + Totals ───────────────────────────────────────── */}
          <div className="mb-2">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Summary
            </p>
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <DiscountFields
                discountType={discountType}
                discountValue={discountValue}
                discountReason={discountReason}
                onChangeType={setDiscountType}
                onChangeValue={setDiscountValue}
                onChangeReason={setDiscountReason}
                valueError={state?.fields?.discountValid}
              />

              <OrderSummaryReceipt
                subtotal={subtotal}
                discountAmount={discountAmount}
                discountType={discountType}
                discountValue={discountValue}
                total={total}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3 sm:px-5 sm:py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-order-form"
            disabled={isPending || items.length === 0 || !selectedCustomer}
          >
            {isPending ? "Creating…" : "Create order"}
          </Button>
        </div>
      </div>
    </div>
  );
}