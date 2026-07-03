import Link from "next/link";
import { dummyOrders } from "@/lib/dummy-data/orders";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function MyOrdersPage() {
  // NOTE: once lib/api/customer/* exists, filter dummyOrders by the
  // logged-in customer's ID here instead of showing all orders.

  return (
    <>
      <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
        Your orders
      </h1>

      <div className="flex flex-col gap-2.5">
        {dummyOrders.map((order) => (
          <Link
            key={order.id}
            href={`/my/orders/${order.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5"
          >
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Order #{order.id}
              </p>
              <p className="text-xs text-muted-foreground">{order.item}</p>
            </div>
            <StatusBadge status={order.status}>{order.statusLabel}</StatusBadge>
          </Link>
        ))}
      </div>
    </>
  );
}