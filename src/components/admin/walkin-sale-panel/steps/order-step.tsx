"use client";

import { Search, Loader2, Minus, Plus, Check } from "lucide-react";
import { PRODUCT_SIZES, PRODUCT_SIZE_LABELS, type Product } from "@/types/product";
import type { AdminUser } from "@/types/user";
import type { DiscountType } from "@/types/order";
import type { OrderLine } from "../types";
import { getPrice } from "../utils";

interface OrderStepProps {
  selectedCustomer: AdminUser | null;
  createdOrderId: string | null;

  productSearch: string;
  setProductSearch: (v: string) => void;
  productsLoading: boolean;
  productsError: string | null;
  filteredProducts: Product[];

  orderItems: OrderLine[];
  toggleProduct: (p: Product) => void;
  updateItemQuantity: (key: string, delta: number) => void;
  updateItemSize: (key: string, size: string) => void;

  fulfillmentMethod: string;
  setFulfillmentMethod: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  orderNotes: string;
  setOrderNotes: (v: string) => void;

  discountType: DiscountType | "";
  setDiscountType: (v: DiscountType | "") => void;
  discountValue: string;
  setDiscountValue: (v: string) => void;
  discountReason: string;
  setDiscountReason: (v: string) => void;

  subtotal: number;
  discountAmount: number;
  orderTotal: number;
  orderError: string | null;
}

export function OrderStep({
  selectedCustomer,
  createdOrderId,
  productSearch,
  setProductSearch,
  productsLoading,
  productsError,
  filteredProducts,
  orderItems,
  toggleProduct,
  updateItemQuantity,
  updateItemSize,
  fulfillmentMethod,
  setFulfillmentMethod,
  paymentMethod,
  setPaymentMethod,
  orderNotes,
  setOrderNotes,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  discountReason,
  setDiscountReason,
  subtotal,
  discountAmount,
  orderTotal,
  orderError,
}: OrderStepProps) {
  if (createdOrderId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-status-completed/30 bg-status-completed/5 py-6 text-center">
          <Check className="h-5 w-5 text-status-completed" />
          <p className="text-sm font-medium text-status-completed">Order created.</p>
          <p className="text-[11px] text-muted-foreground">
            Order #{createdOrderId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search dresses, jewelry..."
          className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {productsLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading products...
        </div>
      )}
      {!productsLoading && productsError && (
        <p className="py-2 text-center text-xs text-destructive">{productsError}</p>
      )}

      {!productsLoading && !productsError && productSearch.trim().length > 0 && (
        <div className="max-h-44 overflow-y-auto rounded-lg border border-border">
          {filteredProducts.map((p) => {
            const isSelected = orderItems.some((i) => i.product.id === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p)}
                className={`flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left last:border-b-0 transition-colors ${
                  isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  {p.category?.name && (
                    <p className="truncate text-xs text-muted-foreground">{p.category.name}</p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  Rs {getPrice(p).toLocaleString("en-LK")}
                </p>
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">No products found.</p>
          )}
        </div>
      )}

      {orderItems.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {orderItems.map((item) => (
            <div key={item.key} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                  {item.product.name}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.key, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-primary/5"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm tabular-nums text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.key, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-primary/5"
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
                      onClick={() => updateItemSize(item.key, size)}
                      className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
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

      <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-3.5">
        <div>
          <label className="mb-1 block text-[11px] text-muted-foreground">Fulfillment</label>
          <select
            value={fulfillmentMethod}
            onChange={(e) => setFulfillmentMethod(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="PICKUP" className="bg-background text-foreground">Pickup</option>
            <option value="DELIVERY" className="bg-background text-foreground">Delivery</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-muted-foreground">Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="CASH" className="bg-background text-foreground">Cash</option>
            <option value="PAYHERE" className="bg-background text-foreground">PayHere</option>
          </select>
        </div>
      </div>

      {fulfillmentMethod === "DELIVERY" && (
        <p className="text-[11px] text-muted-foreground">
          Delivery address comes from {selectedCustomer?.firstName ?? "the customer"}&apos;s
          profile — update it on their customer page if it&apos;s missing or wrong.
        </p>
      )}

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Notes</label>
        <input
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Discount (optional)</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(["", "PERCENTAGE", "FIXED"] as const).map((type) => (
            <button
              key={type || "none"}
              type="button"
              onClick={() => {
                setDiscountType(type);
                setDiscountValue("");
              }}
              className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                discountType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {type === "" ? "None" : type === "PERCENTAGE" ? "Percent" : "Fixed"}
            </button>
          ))}
        </div>
        {discountType && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "e.g. 10 (%)" : "e.g. 2000 (Rs)"}
              className="rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
            <input
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder="Reason"
              className="rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-border p-3 font-mono text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">Rs {subtotal.toLocaleString("en-LK")}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="text-destructive">−Rs {discountAmount.toLocaleString("en-LK")}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2 text-base font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">Rs {orderTotal.toLocaleString("en-LK")}</span>
        </div>
      </div>

      {orderError && <p className="text-xs text-destructive">{orderError}</p>}
    </div>
  );
}
