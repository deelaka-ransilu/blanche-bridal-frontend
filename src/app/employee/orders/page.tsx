import Link from "next/link";
import { getMyAssignedProductions } from "@/lib/api/production";
import { getOrderById } from "@/lib/api/orders";
import { PRODUCTION_STAGE_LABELS } from "@/types/production";
import { formatDate } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function EmployeeOrdersPage() {
  const result = await getMyAssignedProductions();

  if (!result.success) {
    return (
      <div>
        <h1 className="font-heading mb-4 text-xl font-medium text-foreground">
          Assigned orders
        </h1>
        <p className="text-sm text-status-cancelled">
          Couldn&apos;t load your assigned orders: {result.message}
        </p>
      </div>
    );
  }

  const records = result.data;

  // Each production record only carries orderId — fetch the underlying
  // Order for customer/amount display. Sequential-ish via Promise.all;
  // list size is bounded by how many orders one employee has active at
  // once, so this is fine without a batch endpoint.
  const rows = await Promise.all(
    records.map(async (record) => {
      const orderResult = await getOrderById(record.orderId);
      return { record, order: orderResult.success ? orderResult.data : null };
    })
  );

  return (
    <div>
      <h1 className="font-heading mb-1 text-xl font-medium text-foreground">
        Assigned orders
      </h1>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Custom orders currently assigned to you for production
      </p>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No orders are assigned to you right now.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {rows.map(({ record, order }) => {
          const customerName = order
            ? [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") ||
              order.customerEmail ||
              "Unknown customer"
            : "Unknown customer";

          return (
            <Link
              key={record.id}
              href={`/employee/orders/${record.orderId}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 hover:border-primary/40"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  #{record.orderId.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {customerName}
                  {order?.createdAt ? ` · ${formatDate(order.createdAt)}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    record.status === "PENDING_APPROVAL"
                      ? "bg-status-pending/15 text-status-pending"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {record.status === "PENDING_APPROVAL"
                    ? "Awaiting admin approval"
                    : PRODUCTION_STAGE_LABELS[record.currentStage]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}