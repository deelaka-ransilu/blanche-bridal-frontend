import Link from "next/link";
import type { Order, OrderStatus } from "@/types/order";

const COLUMNS: { status: OrderStatus; label: string; accent: string }[] = [
  { status: "PENDING", label: "Pending", accent: "bg-status-pending" },
  { status: "CONFIRMED", label: "Confirmed", accent: "bg-status-progress" },
  { status: "PROCESSING", label: "Processing", accent: "bg-status-progress" },
  { status: "READY", label: "Ready", accent: "bg-status-completed" },
  { status: "COMPLETED", label: "Completed", accent: "bg-status-completed" },
];

// Cap per column so the board stays scannable — a link to the filtered
// full list covers the rest, same pattern as ordersBreakdown's hrefs.
const MAX_CARDS_PER_COLUMN = 3;

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

function customerName(order: Order): string {
  const name = `${order.customerFirstName ?? ""} ${order.customerLastName ?? ""}`.trim();
  return name || order.customerEmail || "Walk-in customer";
}

export function OrdersPipelineBoard({ orders }: { orders: Order[] }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-base font-medium text-foreground">Orders pipeline</p>
        <Link href="/admin/orders" className="text-xs text-primary hover:underline">
          View all orders
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.status);
          const shown = columnOrders.slice(0, MAX_CARDS_PER_COLUMN);
          const remaining = columnOrders.length - shown.length;

          return (
            <div key={col.status}>
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className={`h-1.5 w-1.5 rounded-full ${col.accent}`} />
                <p className="text-xs font-medium text-foreground">{col.label}</p>
                <span className="text-[11px] text-muted-foreground">{columnOrders.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {shown.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border px-2 py-3 text-center text-[11px] text-muted-foreground">
                    No orders
                  </div>
                )}
                {shown.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-lg border border-border bg-background p-2.5 transition-colors hover:bg-accent/40"
                  >
                    <p className="truncate text-xs font-medium text-foreground">
                      {customerName(order)}
                    </p>
                    <span className="mt-1 block text-[11px] font-medium text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </Link>
                ))}
                {remaining > 0 && (
                  <Link
                    href={`/admin/orders?status=${col.status}`}
                    className="block rounded-lg border border-dashed border-border px-2 py-1.5 text-center text-[11px] text-primary hover:bg-accent/40"
                  >
                    +{remaining} more
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}