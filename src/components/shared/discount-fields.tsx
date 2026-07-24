// src/components/shared/discount-fields.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DiscountType } from "@/types/order";

export function DiscountFields({
  discountType,
  discountValue,
  discountReason,
  onChangeType,
  onChangeValue,
  onChangeReason,
  valueError,
}: {
  discountType: DiscountType | "";
  discountValue: string;
  discountReason: string;
  onChangeType: (type: DiscountType | "") => void;
  onChangeValue: (value: string) => void;
  onChangeReason: (reason: string) => void;
  valueError?: string;
}) {
  return (
    <>
      <div className="mb-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
        {(["", "PERCENTAGE", "FIXED"] as const).map((type) => (
          <button
            key={type || "none"}
            type="button"
            onClick={() => {
              onChangeType(type);
              onChangeValue("");
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
      <input type="hidden" name="discountType" value={discountType} />

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
              onChange={(e) => onChangeValue(e.target.value)}
              className="mt-1"
            />
            {valueError && <p className="mt-1 text-xs text-destructive">{valueError}</p>}
          </div>
          <div>
            <Label htmlFor="discountReason">Reason</Label>
            <Input
              id="discountReason"
              name="discountReason"
              value={discountReason}
              onChange={(e) => onChangeReason(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </>
  );
}