import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSummaryReport } from "@/lib/api/reports";
import { getAllOrders } from "@/lib/api/orders";
import { getInquiries } from "@/lib/api/inquiries";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

// ---- status mapping helpers -------------------------------------------
// StatusBadge only knows 4 buckets; backend has more granular statuses.
// Map explicitly rather than guessing — no fallback that could silently
// mislabel something as "completed".

const ORDER_STATUS_MAP: Record<OrderStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  PROCESSING: "progress",
  READY: "progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const INQUIRY_STATUS_MAP: Record<InquiryStatus, Status> = {
  OPEN: "pending",
  IN_PROGRESS: "progress",
  RESOLVED: "completed",
};

const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN: "Unanswered",
  IN_PROGRESS: "In progress",
  RESOLVED: "Replied",
};

const RECENT_LIMIT = 5;

// ---- helpers ------------------------------------------------------------

function orderTitle(order: Order): string {
  const first = order.customerFirstName ?? "";
  const last = order.customerLastName ?? "";
  const name = `${first} ${last}`.trim() || order.customerEmail || "Unknown customer";
  const itemSummary =
    order.items.length > 0
      ? order.items.length === 1
        ? order.items[0].productName
        : `${order.items[0].productName} +${order.items.length - 1} more`
      : "No items";
  return `${name} · ${itemSummary}`;
}

// createdAt can be null (known backend bug, see CURRENT_STATE.md) --
// push null-dated orders to the end instead of crashing or mis-sorting.
function sortByCreatedAtDesc<T extends { createdAt: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

// ---------------------------------------------------------------------

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [summaryResult, ordersResult, inquiriesResult] = await Promise.all([
    getSummaryReport(),
    getAllOrders(),
    getInquiries(),
  ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const orders = ordersResult.success ? ordersResult.data : [];
  const inquiries = inquiriesResult.success ? inquiriesResult.data : [];

  const recentOrders = sortByCreatedAtDesc(orders).slice(0, RECENT_LIMIT);
  const recentInquiries = sortByCreatedAtDesc(inquiries).slice(0, RECENT_LIMIT);

  // Active rentals + pending appointments aren't in SummaryReport (it's
  // revenue/refund/discount-scoped, per types/report.ts) -- rather than
  // fabricate a number, only render stats that actually exist in the type.
  // Rental/appointment counts need their own api/* calls once those pages
  // are reached in the Block 3 sequence (steps 7/9) -- flagging instead of
  // guessing a shape now.

  return (
    <div>
      <div className="mb-6">
        <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-xl font-medium text-foreground">
          Hi, {firstName}
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Completed orders"
          value={summary ? String(summary.completedOrderCount) : "—"}
        />
        <StatCard
          label="Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : "—"}
        />
        <StatCard
          label="Refunds"
          value={summary ? String(summary.refundCount) : "—"}
        />
        <StatCard
          label="Discounted orders"
          value={summary ? String(summary.discountedOrderCount) : "—"}
        />
      </div>

      {!summaryResult.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load summary report: {summaryResult.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent orders
          </p>
          <div className="flex flex-col gap-2.5">
            {recentOrders.length === 0 && (
              <p className="text-xs text-muted-foreground">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <OrderRow
                key={order.id}
                title={`Order #${order.id.slice(0, 8)}`}
                subtitle={orderTitle(order)}
                status={ORDER_STATUS_MAP[order.status]}
                statusLabel={ORDER_STATUS_LABEL[order.status]}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent inquiries
          </p>
          <div className="flex flex-col gap-2.5">
            {recentInquiries.length === 0 && (
              <p className="text-xs text-muted-foreground">No inquiries yet.</p>
            )}
            {recentInquiries.map((inquiry) => (
              <OrderRow
                key={inquiry.id}
                title={inquiry.subject || "General inquiry"}
                subtitle={`${inquiry.name} · ${inquiry.message.slice(0, 40)}${inquiry.message.length > 40 ? "…" : ""}`}
                status={INQUIRY_STATUS_MAP[inquiry.status]}
                statusLabel={INQUIRY_STATUS_LABEL[inquiry.status]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}