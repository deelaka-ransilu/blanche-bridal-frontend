import { getAllOrders } from "@/lib/api/orders";
import { getAllRentals } from "@/lib/api/rentals";
import { getAvailableProducts } from "@/lib/api/products";
import { getCustomers } from "@/lib/api/customers";
import { NewOrderTrigger } from "@/components/orders/new-order-trigger";
import { NewRentalTrigger } from "@/components/rentals/new-rental-trigger";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { AdminOrdersTabsWithHeader } from "@/components/admin/admin-orders-tabs-with-header";
import type { OrderStatus } from "@/types/order";
import { getAllCustomOrders } from "@/lib/api/custom-design";
import type { Rental, RentalStatus } from "@/types/rental";

function toBadgeStatus(status: OrderStatus): Status {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "PROCESSING":
    case "READY":
      return "progress";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING": return "Pending";
    case "CONFIRMED": return "Confirmed";
    case "PROCESSING": return "Processing";
    case "READY": return "Ready";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
  }
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

function stageLabel(stage: string | null): string {
  if (!stage) return "Not started";
  return stage
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const RENTAL_STATUS_MAP: Record<RentalStatus, Status> = {
  PENDING_PAYMENT: "pending",
  BOOKED: "progress",
  ACTIVE: "progress",
  OVERDUE: "cancelled",
  RETURNED: "completed",
  CANCELLED: "cancelled",
};

const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  BOOKED: "Booked",
  ACTIVE: "Active",
  OVERDUE: "Overdue",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

// Terminal statuses sink to the bottom (most recent first). Everything else
// sorts by whichever date is most relevant to what the admin needs to act on
// next — soonest first, so the most time-sensitive rentals surface at top.
const TERMINAL: RentalStatus[] = ["RETURNED", "CANCELLED"];

function sortKey(rental: Rental): number {
  const pick = (d: string | null) => (d ? new Date(d + "T00:00:00").getTime() : Infinity);

  switch (rental.status) {
    case "PENDING_PAYMENT":
      return pick(rental.fittingDate) ;
    case "BOOKED":
      return pick(rental.fittingDate ?? rental.rentalStart);
    case "ACTIVE":
    case "OVERDUE":
      return pick(rental.rentalEnd);
    default:
      return Infinity;
  }
}

function sortRentals(rentals: Rental[]): Rental[] {
  const active = rentals.filter((r) => !TERMINAL.includes(r.status));
  const terminal = rentals.filter((r) => TERMINAL.includes(r.status));

  active.sort((a, b) => sortKey(a) - sortKey(b));
  terminal.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return [...active, ...terminal];
}

export default async function AdminOrdersPage() {
  const [ordersResult, rentalsResult, productsResult, customersResult, customOrdersResult] =
    await Promise.all([
      getAllOrders(),
      getAllRentals(),
      getAvailableProducts(),
      getCustomers(),
      getAllCustomOrders(),
    ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  const rentals = rentalsResult.success ? sortRentals(rentalsResult.data) : [];
  const products = productsResult.success ? productsResult.data : [];
  const customers = customersResult.success ? customersResult.data : [];
  const customOrders = customOrdersResult.success ? customOrdersResult.data : [];

  const purchasesContent = (
    <div>
      {!ordersResult.success && (
        <p className="mb-3 text-sm text-status-cancelled">
          Couldn&apos;t load orders: {ordersResult.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {orders.map((order) => {
          const customerName = [order.customerFirstName, order.customerLastName]
            .filter(Boolean)
            .join(" ") || order.customerEmail || "Unknown customer";
          const firstItem = order.items[0];
          const itemSummary = firstItem
            ? firstItem.productName + (order.items.length > 1 ? ` +${order.items.length - 1} more` : "")
            : "No items";

          return (
            <a
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between ${
                order.status === "CANCELLED" ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {customerName} · {itemSummary}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {order.isRentalDeposit && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Rental Deposit
                  </span>
                )}
                <StatusBadge status={toBadgeStatus(order.status)}>
                  {statusLabel(order.status)}
                </StatusBadge>
              </div>
            </a>
          );
        })}
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );

  const rentalsContent = (
    <div className="space-y-2.5">
      {!rentalsResult.success && (
        <p className="text-sm text-destructive">{rentalsResult.message}</p>
      )}
      {!productsResult.success && (
        <p className="text-sm text-destructive">
          Failed to load products: {productsResult.message}
        </p>
      )}
      {!customersResult.success && (
        <p className="text-sm text-destructive">
          Failed to load customers: {customersResult.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {rentals.map((rental) => {
          const dateLine =
            rental.status === "PENDING_PAYMENT" && rental.fittingDate
              ? `Fitting ${rental.fittingDate}`
              : rental.status === "BOOKED" && rental.fittingDate
                ? `Fitting ${rental.fittingDate} · pickup ${rental.rentalStart}`
                : `${rental.rentalStart} → ${rental.rentalEnd}`;

          return (
            <a
              key={rental.id}
              href={`/admin/rentals/${rental.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{rental.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {rental.customerName} · {dateLine}
                </p>
              </div>
              <StatusBadge status={RENTAL_STATUS_MAP[rental.status]}>
                {RENTAL_STATUS_LABEL[rental.status]}
              </StatusBadge>
            </a>
          );
        })}
        {rentals.length === 0 && (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        )}
      </div>
    </div>
  );

  const customOrdersContent = (
    <div className="space-y-2.5">
      {!customOrdersResult.success && (
        <p className="text-sm text-destructive">{customOrdersResult.message}</p>
      )}

      <div className="flex flex-col gap-2.5">
        {customOrders.map((co) => (
          <a
            key={co.id}
            href={`/admin/custom-orders/${co.id}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{co.customerName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {co.customerEmail} · occasion {co.occasionDate}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {co.firstPaymentStatus === null ? (
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Awaiting quote
                </span>
              ) : (
                <>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {stageLabel(co.currentProductionStage)}
                  </span>
                  <StatusBadge status={toBadgeStatus(co.firstPaymentStatus as OrderStatus)}>
                    {statusLabel(co.firstPaymentStatus as OrderStatus)}
                  </StatusBadge>
                </>
              )}
            </div>
          </a>
        ))}
        {customOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">No custom orders yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <AdminOrdersTabsWithHeader
      purchasesCount={orders.length}
      rentalsCount={rentals.length}
      customOrdersCount={customOrders.length}
      purchasesContent={purchasesContent}
      rentalsContent={rentalsContent}
      customOrdersContent={customOrdersContent}
      orderTrigger={<NewOrderTrigger products={products} customers={customers} />}
      rentalTrigger={<NewRentalTrigger products={products} customers={customers} />}
    />
  );
}