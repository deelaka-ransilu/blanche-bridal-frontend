"use client";

import type { DiscountType } from "@/types/order";

export function OrderSummaryReceipt({
  subtotal,
  discountAmount,
  discountType,
  discountValue,
  total,
}: {
  subtotal: number;
  discountAmount: number;
  discountType: DiscountType | "";
  discountValue: string;
  total: number;
}) {
  return (
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
  );
}