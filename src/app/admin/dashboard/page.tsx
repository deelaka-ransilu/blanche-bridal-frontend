import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSummaryReport, getRevenueReport } from "@/lib/api/reports";
import { getAllOrders } from "@/lib/api/orders";
import { getInquiries } from "@/lib/api/inquiries";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { Wallet, CheckCircle2, RefreshCw, Tag } from "lucide-react";

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

const RECENT_LIMIT = 6;

// Order statuses that represent work still owed to the customer — these
// drive the "Needs attention" count and the pipeline strip below it.
const PIPELINE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
];

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
// push null-dated items to the end instead of crashing or mis-sorting.
function byCreatedAtDesc(a: { createdAt: string | null }, b: { createdAt: string | null }) {
  if (!a.createdAt && !b.createdAt) return 0;
  if (!a.createdAt) return 1;
  if (!b.createdAt) return -1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortByCreatedAtDesc<T extends { createdAt: string | null }>(items: T[]): T[] {
  return [...items].sort(byCreatedAtDesc);
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

type ActivityItem =
  | { kind: "order"; createdAt: string | null; order: Order }
  | { kind: "inquiry"; createdAt: string | null; inquiry: Inquiry };

// ---------------------------------------------------------------------

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [summaryResult, ordersResult, inquiriesResult, revenueResult] = await Promise.all([
    getSummaryReport(),
    getAllOrders(),
    getInquiries(),
    getRevenueReport(),
  ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const orders = ordersResult.success ? ordersResult.data : [];
  const inquiries = inquiriesResult.success ? inquiriesResult.data : [];
  const revenue = revenueResult.success ? revenueResult.data : [];

  // "Needs attention" -- work that's actually waiting on someone here,
  // computed from data already fetched above rather than a new endpoint.
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const openInquiries = inquiries.filter((i) => i.status === "OPEN");
  const attentionCount = pendingOrders.length + openInquiries.length;

  // Order pipeline breakdown -- where orders actually are right now,
  // instead of one ambiguous "completed" count.
  const pipelineCounts = PIPELINE_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABEL[status],
    count: orders.filter((o) => o.status === status).length,
  }));

  // Merged, chronological activity feed instead of two disconnected lists.
  const activity: ActivityItem[] = [
    ...orders.map((order): ActivityItem => ({ kind: "order", createdAt: order.createdAt, order })),
    ...inquiries.map((inquiry): ActivityItem => ({
      kind: "inquiry",
      createdAt: inquiry.createdAt,
      inquiry,
    })),
  ]
    .sort(byCreatedAtDesc)
    .slice(0, RECENT_LIMIT);

  return (
    <div>
      <div className="mb-6">
        <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-xl font-medium text-foreground">
          Hi, {firstName}
        </h1>
      </div>

      {/* Needs attention -- the thing an owner should see first, not buried
          after revenue totals. Only rendered when there's actually
          something waiting, so it doesn't create false urgency. */}
      {attentionCount > 0 && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            {attentionCount} thing{attentionCount === 1 ? "" : "s"} need
            {attentionCount === 1 ? "s" : ""} attention
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {pendingOrders.length > 0 && (
              <span>
                <span className="font-medium text-foreground">{pendingOrders.length}</span>{" "}
                order{pendingOrders.length === 1 ? "" : "s"} awaiting confirmation
              </span>
            )}
            {openInquiries.length > 0 && (
              <span>
                <span className="font-medium text-foreground">{openInquiries.length}</span>{" "}
                unanswered inquir{openInquiries.length === 1 ? "y" : "ies"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top-level stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : "—"}
          icon={Wallet}
        />
        <StatCard
          label="Completed orders"
          value={summary ? String(summary.completedOrderCount) : "—"}
          icon={CheckCircle2}
        />
        <StatCard
          label="Refunds"
          value={summary ? String(summary.refundCount) : "—"}
          icon={RefreshCw}
        />
        <StatCard
          label="Discounted orders"
          value={summary ? String(summary.discountedOrderCount) : "—"}
          icon={Tag}
        />
      </div>

      {!summaryResult.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load summary report: {summaryResult.message}
        </p>
      )}

      {/* Revenue chart */}
      <div className="mb-6">
        <RevenueChart data={revenue} />
      </div>

      {!revenueResult.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load revenue report: {revenueResult.message}
        </p>
      )}

      {/* Order pipeline -- where orders actually sit right now */}
      <div className="mb-8">
        <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
          Order pipeline
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pipelineCounts.map(({ status, label, count }) => (
            <div
              key={status}
              className="rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-lg font-medium text-foreground">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity -- orders and inquiries merged into one feed */}
      <div>
        <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
          Recent activity
        </p>
        <div className="flex flex-col gap-2.5">
          {activity.length === 0 && (
            <p className="text-xs text-muted-foreground">Nothing yet.</p>
          )}
          {activity.map((item) =>
            item.kind === "order" ? (
              <OrderRow
                key={`order-${item.order.id}`}
                title={`Order #${item.order.id.slice(0, 8)}`}
                subtitle={orderTitle(item.order)}
                status={ORDER_STATUS_MAP[item.order.status]}
                statusLabel={ORDER_STATUS_LABEL[item.order.status]}
              />
            ) : (
              <OrderRow
                key={`inquiry-${item.inquiry.id}`}
                title={item.inquiry.subject || "General inquiry"}
                subtitle={`${item.inquiry.name} · ${item.inquiry.message.slice(0, 40)}${item.inquiry.message.length > 40 ? "…" : ""}`}
                status={INQUIRY_STATUS_MAP[item.inquiry.status]}
                statusLabel={INQUIRY_STATUS_LABEL[item.inquiry.status]}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}