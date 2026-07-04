import Link from "next/link";
import { getMyOrders } from "@/lib/api/orders";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import type { OrderStatus } from "@/types/order";

// Note: /api/orders/my is already filtered to the logged-in customer server-side
// (JwtUtil-derived userId in OrderController), so no client-side customerId
// filtering is needed here — this resolves CURRENT_STATE.md Issue #13 without
// needing a customerId field on the Order type at all.

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
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "PROCESSING":
      return "Processing";
    case "READY":
      return "Ready";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
  }
}

export default async function MyOrdersPage() {
  const result = await getMyOrders();

  if (!result.success) {
    return (
      <>
        <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
          Your orders
        </h1>
        <p className="text-sm text-status-cancelled">
          Couldn&apos;t load your orders: {result.message}
        </p>
      </>
    );
  }

  const orders = result.data;

  return (
    <>
      <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
        Your orders
      </h1>

      <div className="flex flex-col gap-2.5">
        {orders.map((order) => {
          const firstItem = order.items[0];
          const itemSummary = firstItem
            ? firstItem.productName + (order.items.length > 1 ? ` +${order.items.length - 1} more` : "")
            : "No items";

          return (
            <Link
              key={order.id}
              href={`/my/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5"
            >
              <div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">{itemSummary}</p>
              </div>
              <StatusBadge status={toBadgeStatus(order.status)}>
                {statusLabel(order.status)}
              </StatusBadge>
            </Link>
          );
        })}
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        )}
      </div>
    </>
  );
}