import type { Rental } from "@/types/rental";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / msPerDay);
}

export function RentalTracker({ rental }: { rental: Rental }) {
  const today = new Date();
  const start = new Date(rental.rentalStart);
  const end = new Date(rental.rentalEnd);

  const isPendingPayment = rental.status === "PENDING_PAYMENT";
  const isBooked = rental.status === "BOOKED";
  const isActive = rental.status === "ACTIVE";
  const isOverdue = rental.status === "OVERDUE";

  let countdownLabel = "";
  let countdownValue = 0;
  let countdownUnit = "";
  let progress = 0;

  if (isBooked) {
    // Only counts down once the fitting payment is actually confirmed —
    // while PENDING_PAYMENT, pickup isn't guaranteed yet, so no countdown.
    const daysUntilPickup = daysBetween(new Date(today), new Date(start));
    countdownLabel = "Days until pickup";
    countdownValue = Math.max(daysUntilPickup, 0);
    countdownUnit = countdownValue === 1 ? "day left" : "days left";
    progress = daysUntilPickup <= 0 ? 100 : Math.max(10, 100 - daysUntilPickup * 10);
  } else if (isActive) {
    const daysUntilReturn = daysBetween(new Date(today), new Date(end));
    const totalDays = Math.max(daysBetween(new Date(start), new Date(end)), 1);
    const daysElapsed = totalDays - daysUntilReturn;
    countdownLabel = "Days until return";
    countdownValue = Math.max(daysUntilReturn, 0);
    countdownUnit = countdownValue === 1 ? "day left" : "days left";
    progress = Math.min(100, Math.max(5, (daysElapsed / totalDays) * 100));
  }

  const daysOverdue = isOverdue ? Math.max(daysBetween(new Date(end), new Date(today)), 0) : 0;
  const totalDays = Math.max(daysBetween(new Date(start), new Date(end)), 1);

  const rentalFee = rental.rentalFee ?? 0;
  const firstInstallment = Math.round(rentalFee * 0.5);
  const secondInstallment = rentalFee - firstInstallment;
  const securityDeposit = rental.securityDepositAmount ?? 0;

  // First payment (fitting, 50%) is settled once status has moved past
  // PENDING_PAYMENT. Second payment (remaining 50% + deposit, handover) is
  // settled once handoverConfirmedAt is set.
  const firstPaymentPaid = !isPendingPayment;
  const secondPaymentPaid = rental.handoverConfirmedAt != null;

  return (
    <div className="flex flex-col gap-4">
      {isPendingPayment && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">
            Pay 50% in cash when you come in for your fitting — a staff member
            will confirm your payment here once it&apos;s received.
          </p>
        </div>
      )}

      {(isBooked || isActive) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">{countdownLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium text-foreground">{countdownValue}</span>
            <span className="text-[13px] text-muted-foreground">{countdownUnit}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2.5 text-xs text-muted-foreground">Cost breakdown</p>

        <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px]">
          <span className="text-muted-foreground">
            Rental fee ({totalDays} {totalDays === 1 ? "day" : "days"})
          </span>
          <span className="text-foreground">{formatCurrency(rentalFee)}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px]">
          <div>
            <span className="text-muted-foreground">First payment (50%, at fitting)</span>
            <p
              className={`text-[11px] ${firstPaymentPaid ? "text-status-completed" : "text-status-pending"}`}
            >
              {firstPaymentPaid ? "Paid" : "Due at fitting"}
            </p>
          </div>
          <span className="text-foreground">{formatCurrency(firstInstallment)}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
          <div>
            <span className="text-muted-foreground">
              Second payment (50% + security deposit, at pickup)
            </span>
            <p
              className={`text-[11px] ${secondPaymentPaid ? "text-status-completed" : "text-status-pending"}`}
            >
              {secondPaymentPaid ? "Paid" : "Due at pickup"}
            </p>
          </div>
          <span className="text-foreground">
            {formatCurrency(secondInstallment + securityDeposit)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 text-sm font-medium">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatCurrency(rentalFee + securityDeposit)}</span>
        </div>
      </div>

      {isOverdue && (
        <div className="rounded-xl bg-status-cancelled/10 p-4">
          <p className="text-sm font-medium text-status-cancelled">
            {daysOverdue} {daysOverdue === 1 ? "day" : "days"} overdue
          </p>
          <p className="mt-0.5 text-xs text-status-cancelled/80">
            Please return the dress as soon as possible or contact us to arrange an extension.
          </p>
        </div>
      )}
    </div>
  );
}