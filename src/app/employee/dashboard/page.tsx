import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMyAssignedProductions } from "@/lib/api/production";
import { getOrderById } from "@/lib/api/orders";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import { PRODUCTION_STAGE_LABELS } from "@/types/production";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const result = await getMyAssignedProductions();
  const records = result.success ? result.data : [];

  const awaitingApprovalCount = records.filter((r) => r.status === "PENDING_APPROVAL").length;
  const readyToProposeCount = records.filter((r) => r.status !== "PENDING_APPROVAL").length;
  const rejectedCount = records.filter((r) => r.status === "REJECTED").length;

  // Same join pattern as the orders list — needed for customer name/amount
  // in the recent-assignments row.
  const rows = await Promise.all(
    records.slice(0, 5).map(async (record) => {
      const orderResult = await getOrderById(record.orderId);
      return { record, order: orderResult.success ? orderResult.data : null };
    })
  );

  return (
    <div>
      <div className="mb-6">
        <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-xl font-medium text-foreground">
          Hi, {firstName}
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Assigned to you" value={String(records.length)} />
        <StatCard label="Awaiting admin approval" value={String(awaitingApprovalCount)} />
        <StatCard label="Ready to work on" value={String(readyToProposeCount)} />
      </div>

      {!result.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load your assigned orders: {result.message}
        </p>
      )}

      {rejectedCount > 0 && (
        <p className="mb-4 text-xs text-status-cancelled">
          {rejectedCount} recent proposal{rejectedCount === 1 ? "" : "s"} rejected — check notes on
          the order for details.
        </p>
      )}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="font-heading text-[15px] font-medium text-foreground">
            Your assigned orders
          </p>
          <Link href="/employee/orders" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground">No orders assigned to you yet.</p>
          )}
          {rows.map(({ record, order }) => {
            const customerName = order
              ? [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") ||
                order.customerEmail ||
                "Unknown customer"
              : "Unknown customer";

            return (
              <OrderRow
                key={record.id}
                title={`Order #${record.orderId.slice(0, 8)}`}
                subtitle={customerName}
                status={record.status === "PENDING_APPROVAL" ? "pending" : "progress"}
                statusLabel={
                  record.status === "PENDING_APPROVAL"
                    ? "Awaiting approval"
                    : PRODUCTION_STAGE_LABELS[record.currentStage]
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}