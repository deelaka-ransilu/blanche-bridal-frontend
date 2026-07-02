import Link from "next/link";
import { dummyOrders } from "@/lib/dummy-data/orders";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-medium text-foreground">Orders</h1>
        <p className="text-[13px] text-muted-foreground">
          {dummyOrders.length} total orders
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {dummyOrders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5"
          >
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Order #{order.id}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.customerName} · {order.item}
              </p>
            </div>
            <StatusBadge status={order.status}>{order.statusLabel}</StatusBadge>
          </Link>
        ))}
      </div>
    </div>
  );
}