"use client";

import { useActionState, useMemo, useState } from "react";
import { createRentalAction, type CreateRentalState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Check } from "lucide-react";
import type { Product } from "@/types/product";
import { WeekDatePicker } from "./week-date-picker";
import type { AdminUser } from "@/types/user";
import type { DiscountType } from "@/types/order";
import { WeekRangePicker } from "./week-range-picker";

const initialState: CreateRentalState = null;

function getPrice(p: Product): number {
  return p.rentalPrice ?? 0;
}

export function RentalModal({
  products,
  customers,
  onClose,
}: {
  products: Product[];
  customers: AdminUser[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createRentalAction, initialState);

  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null);

  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [discountType, setDiscountType] = useState<DiscountType | "">("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");

  const filteredProducts: Product[] = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, productSearch]);

  const filteredCustomers: AdminUser[] = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, customerSearch]);

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setProductSearch(product.name);
  }

  function selectCustomer(customer: AdminUser) {
    setSelectedCustomer(customer);
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
    setCustomerOpen(false);
  }

  const rentalPrice = selectedProduct ? getPrice(selectedProduct) : 0;
  const subtotal = rentalPrice;
  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : discountType === "FIXED"
        ? Number(discountValue) || 0
        : 0;
  const total = Math.max(subtotal - discountAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <h2 className="font-heading text-lg font-medium text-foreground">New rental</h2>
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
          id="new-rental-form"
          action={formAction}
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5"
        >
          <input type="hidden" name="productId" value={selectedProduct?.id ?? ""} />
          <input type="hidden" name="userId" value={selectedCustomer?.id ?? ""} />
          <input type="hidden" name="rentalStart" value={rentalStart} />
          <input type="hidden" name="rentalEnd" value={rentalEnd} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />
          <input type="hidden" name="discountType" value={discountType} />

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

          {/* ── Customer ─────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Customer
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setCustomerOpen(true);
                }}
                onFocus={() => setCustomerOpen(true)}
                placeholder="Search by name or email…"
                className="pl-8"
              />
              {customerOpen && filteredCustomers.length > 0 && !selectedCustomer && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="flex w-full flex-col items-start rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      <span className="text-foreground">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {state?.fields?.userId && (
              <p className="mt-1 text-xs text-destructive">{state.fields.userId}</p>
            )}
          </div>

          {/* ── Product ──────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Product
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setSelectedProduct(null);
                }}
                placeholder="Search dresses, jewelry…"
                className="pl-8"
              />
            </div>

            {productSearch.trim().length > 0 && !selectedProduct && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-border">
              {filteredProducts.map((p) => {
                const isSelected = false;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProduct(p)}
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
                            <p className="truncate text-xs text-muted-foreground">
                              {p.category.name}
                            </p>
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

            {/* Selected product row — shows price inline, deposit amount right below */}
            {selectedProduct && (
              <div className="mt-2 rounded-lg border border-border p-3">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedProduct.name}
                    </p>
                    {selectedProduct.category?.name && (
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedProduct.category.name}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-medium text-foreground">
                    Rs {rentalPrice.toLocaleString("en-LK")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="depositAmount">Deposit amount</Label>
                  <Input
                    id="depositAmount"
                    name="depositAmount"
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {products.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">No available products found.</p>
            )}
            {state?.fields?.productId && (
              <p className="mt-1 text-xs text-destructive">{state.fields.productId}</p>
            )}
          </div>

          {/* ── Dates ────────────────────────────────────────────────────── */}
          <div className="mb-4">
            <WeekRangePicker
              startValue={rentalStart}
              endValue={rentalEnd}
              onChangeStart={setRentalStart}
              onChangeEnd={setRentalEnd}
            />
          </div>

          {/* ── Payment method ───────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Payment method
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
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
                className={`min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === "PAYHERE"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                PayHere
              </button>
            </div>
          </div>

          {/* ── Discount + Notes + Totals ("Summary") ───────────────────── */}
          <div className="mb-2">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Summary
            </p>
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <div className="mb-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                {(["", "PERCENTAGE", "FIXED"] as const).map((type) => (
                  <button
                    key={type || "none"}
                    type="button"
                    onClick={() => {
                      setDiscountType(type);
                      setDiscountValue("");
                    }}
                    className={`min-w-0 rounded-lg border px-1.5 py-2 text-xs font-medium transition-colors sm:px-2 sm:text-sm ${
                      discountType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {type === "" ? "No discount" : type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                  </button>
                ))}
              </div>

              {discountType && (
                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="discountValue">
                      {discountType === "PERCENTAGE" ? "Percentage off" : "Amount off (Rs)"}
                    </Label>
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountReason">Reason</Label>
                    <Input
                      id="discountReason"
                      name="discountReason"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Receipt-style breakdown */}
              <div className="border-t border-dashed border-border pt-2.5 font-mono text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">Rs {subtotal.toLocaleString("en-LK")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>
                      Discount
                      {discountType === "PERCENTAGE" && discountValue ? ` (${discountValue}%)` : ""}
                    </span>
                    <span className="text-status-cancelled">
                      −Rs {discountAmount.toLocaleString("en-LK")}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2 text-base font-semibold not-italic">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">Rs {total.toLocaleString("en-LK")}</span>
                </div>
              </div>
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
            form="new-rental-form"
            disabled={isPending || !selectedProduct || !selectedCustomer}
          >
            {isPending ? "Creating…" : "Create rental"}
          </Button>
        </div>
      </div>
    </div>
  );
}