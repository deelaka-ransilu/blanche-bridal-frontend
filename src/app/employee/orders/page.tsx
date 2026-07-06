import Link from "next/link";
import { getAllOrders } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function EmployeeOrdersPage() {
  const result = await getAllOrders();

  if (!result.success) {
    return (
      <div>
        <h1 className="font-heading mb-4 text-xl font-medium text-foreground">Orders</h1>
        <p className="text-sm text-status-cancelled">Couldn&apos;t load orders.</p>
      </div>
    );
  }

  const orders = result.data;

  return (
    <div>
      <h1 className="font-heading mb-4 text-xl font-medium text-foreground">Orders</h1>

      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {orders.map((order) => {
          const customerName =
            [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") ||
            order.customerEmail ||
            "Unknown customer";

          return (
            <Link
              key={order.id}
              href={`/employee/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 hover:border-primary/40"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {customerName} · {formatDate(order.createdAt)}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(order.totalAmount)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}