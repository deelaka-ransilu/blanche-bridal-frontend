"use client";

import { useActionState, useMemo, useState } from "react";
import { createRentalBookingAction, type CreateRentalBookingState } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Check } from "lucide-react";
import type { Product } from "@/types/product";
import { WeekDatePicker } from "./week-date-picker";
import type { AdminUser } from "@/types/user";
import type { DiscountType } from "@/types/order";
import { WeekRangePicker } from "./week-range-picker";
import { CustomerSearchField } from "@/components/shared/customer-search-field";
import { DiscountFields } from "@/components/shared/discount-fields";
import { OrderSummaryReceipt } from "@/components/shared/order-summary-receipt";

const initialState: CreateRentalBookingState = null;

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
  const [state, formAction, isPending] = useActionState(createRentalBookingAction, initialState);

  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setProductSearch(product.name);
  }

  function selectCustomer(customer: AdminUser) {
    setSelectedCustomer(customer);
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
            <CustomerSearchField
              customers={customers}
              selectedCustomer={selectedCustomer}
              onSelect={selectCustomer}
              onClear={() => setSelectedCustomer(null)}
              error={state?.fields?.userId}
            />
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
              <DiscountFields
                discountType={discountType}
                discountValue={discountValue}
                discountReason={discountReason}
                onChangeType={setDiscountType}
                onChangeValue={setDiscountValue}
                onChangeReason={setDiscountReason}
              />

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