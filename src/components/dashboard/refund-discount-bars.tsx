export function RefundDiscountBars({
  refundCount,
  discountCount,
}: {
  refundCount: number;
  discountCount: number;
}) {
  const max = Math.max(refundCount, discountCount, 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading text-[15px] font-medium text-foreground">
        Refunds vs discounts
      </p>
      <p className="mb-4 text-xs text-muted-foreground">This month</p>

      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Refunds</span>
            <span>{refundCount}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-status-cancelled"
              style={{ width: `${(refundCount / max) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Discounts</span>
            <span>{discountCount}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(discountCount / max) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}