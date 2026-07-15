import { getAllOrders } from "@/lib/api/orders";
import { getAllRentals } from "@/lib/api/rentals";
import { getAvailableProducts } from "@/lib/api/products";
import { getCustomers } from "@/lib/api/customers";
import { NewOrderTrigger } from "@/components/orders/new-order-trigger";
import { NewRentalTrigger } from "@/components/rentals/new-rental-trigger";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { markReturnedAction } from "@/lib/actions/rentals";
import { ConfirmCashPaymentButton } from "@/components/orders/confirm-cash-payment-button";
import { Button } from "@/components/ui/button";
import { AdminOrdersTabsWithHeader } from "@/components/admin/admin-orders-tabs-with-header";
import type { OrderStatus } from "@/types/order";
import type { RentalStatus } from "@/types/rental";

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

function canMarkReturned(status: RentalStatus): boolean {
  return status === "ACTIVE" || status === "OVERDUE";
}

export default async function AdminOrdersPage() {
  const [ordersResult, rentalsResult, productsResult, customersResult] = await Promise.all([
    getAllOrders(),
    getAllRentals(),
    getAvailableProducts(),
    getCustomers(),
  ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  const rentals = rentalsResult.success ? rentalsResult.data : [];
  const products = productsResult.success ? productsResult.data : [];
  const customers = customersResult.success ? customersResult.data : [];

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
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{rental.productName}</p>
              <p className="text-xs text-muted-foreground">
                {rental.customerName} · {rental.rentalStart} → {rental.rentalEnd}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
              <StatusBadge status={RENTAL_STATUS_MAP[rental.status]}>
                {RENTAL_STATUS_LABEL[rental.status]}
              </StatusBadge>

              {rental.status === "PENDING_PAYMENT" && rental.orderId && (
                <div className="w-full sm:w-48">
                  <ConfirmCashPaymentButton orderId={rental.orderId} />
                </div>
              )}

              {canMarkReturned(rental.status) && (
                <form
                  action={markReturnedAction.bind(null, rental.id)}
                  className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                >
                  <input
                    type="date"
                    name="returnDate"
                    required
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm sm:flex-none"
                  />
                  <Button type="submit" size="sm">
                    Mark Returned
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {rentals.length === 0 && (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <AdminOrdersTabsWithHeader
      purchasesCount={orders.length}
      rentalsCount={rentals.length}
      purchasesContent={purchasesContent}
      rentalsContent={rentalsContent}
      orderTrigger={<NewOrderTrigger products={products} customers={customers} />}
      rentalTrigger={<NewRentalTrigger products={products} customers={customers} />}
    />
  );
}