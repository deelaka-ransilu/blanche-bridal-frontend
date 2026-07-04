import Link from "next/link";
import { getAllOrders } from "@/lib/api/orders";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import type { OrderStatus } from "@/types/order";

// Real OrderStatus has 6 values; StatusBadge's Status type only has 4.
// Collapsing PROCESSING/READY/CONFIRMED into "progress" loses some
// granularity — documented simplification, see CURRENT_STATE.md.
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

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function AdminOrdersPage() {
  const result = await getAllOrders();

  if (!result.success) {
    return (
      <div>
        <h1 className="font-heading text-xl font-medium text-foreground">Orders</h1>
        <p className="mt-4 text-sm text-status-cancelled">
          Couldn&apos;t load orders: {result.message}
        </p>
      </div>
    );
  }

  const orders = result.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-medium text-foreground">Orders</h1>
        <p className="text-[13px] text-muted-foreground">
          {result.pagination.total} total orders
        </p>
      </div>

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
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5"
            >
              <div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customerName} · {itemSummary} · {formatCurrency(order.totalAmount)}
                </p>
              </div>
              <StatusBadge status={toBadgeStatus(order.status)}>
                {statusLabel(order.status)}
              </StatusBadge>
            </Link>
          );
        })}
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}