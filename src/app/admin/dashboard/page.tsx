import {
  getSummaryReport,
  getRevenueReport,
  getRefundReport,
  getDiscountReport,
} from "@/lib/api/reports";
import { getAllOrders } from "@/lib/api/orders";
import { getInquiries } from "@/lib/api/inquiries";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderStatusDonut } from "@/components/dashboard/order-status-donut";
import { RefundDiscountBars } from "@/components/dashboard/refund-discount-bars";
import { PipelineTable } from "@/components/dashboard/pipeline-table";
import { computeTrend } from "@/lib/dashboard-trend";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { Wallet, CheckCircle2, RefreshCw, Tag } from "lucide-react";

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

const PIPELINE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "READY"];

const PIPELINE_COLOR_VAR: Record<OrderStatus, string> = {
  PENDING: "var(--status-pending)",
  CONFIRMED: "var(--status-progress)",
  PROCESSING: "var(--status-progress)",
  READY: "var(--status-progress)",
  COMPLETED: "var(--status-completed)",
  CANCELLED: "var(--status-cancelled)",
};

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

function byCreatedAtDesc(a: { createdAt: string | null }, b: { createdAt: string | null }) {
  if (!a.createdAt && !b.createdAt) return 0;
  if (!a.createdAt) return 1;
  if (!b.createdAt) return -1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

type ActivityItem =
  | { kind: "order"; createdAt: string | null; order: Order }
  | { kind: "inquiry"; createdAt: string | null; inquiry: Inquiry };

export default async function AdminDashboard() {
  const [summaryResult, ordersResult, inquiriesResult, revenueResult, refundResult, discountResult] =
    await Promise.all([
      getSummaryReport(),
      getAllOrders(),
      getInquiries(),
      getRevenueReport(),
      getRefundReport(),
      getDiscountReport(),
    ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const orders = ordersResult.success ? ordersResult.data : [];
  const inquiries = inquiriesResult.success ? inquiriesResult.data : [];
  const revenue = revenueResult.success ? revenueResult.data : [];
  const refunds = refundResult.success ? refundResult.data : [];
  const discounts = discountResult.success ? discountResult.data : [];

  const revenueTrend = computeTrend(revenue.map((r) => r.totalRevenue));
  const completedOrdersTrend = computeTrend(revenue.map((r) => r.orderCount));
  const refundsTrend = computeTrend(refunds.map((r) => r.refundCount));
  const discountedOrdersTrend = computeTrend(
    discounts.map((d) => d.fixedDiscountOrderCount + d.percentageDiscountOrderCount),
  );

  const latestRefundCount = refunds.length > 0 ? refunds[refunds.length - 1].refundCount : 0;
  const latestDiscountCount =
    discounts.length > 0
      ? discounts[discounts.length - 1].fixedDiscountOrderCount +
        discounts[discounts.length - 1].percentageDiscountOrderCount
      : 0;

  const orderStatusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const openInquiries = inquiries.filter((i) => i.status === "OPEN");
  const attentionCount = pendingOrders.length + openInquiries.length;

  const pipelineRows = PIPELINE_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABEL[status],
    count: orders.filter((o) => o.status === status).length,
    colorVar: PIPELINE_COLOR_VAR[status],
  }));

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

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : "—"}
          icon={Wallet}
          trend={revenueTrend}
        />
        <StatCard
          label="Completed orders"
          value={summary ? String(summary.completedOrderCount) : "—"}
          icon={CheckCircle2}
          trend={completedOrdersTrend}
        />
        <StatCard
          label="Refunds"
          value={summary ? String(summary.refundCount) : "—"}
          icon={RefreshCw}
          trend={refundsTrend}
        />
        <StatCard
          label="Discounted orders"
          value={summary ? String(summary.discountedOrderCount) : "—"}
          icon={Tag}
          trend={discountedOrdersTrend}
        />
      </div>

      {!summaryResult.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load summary report: {summaryResult.message}
        </p>
      )}

      {/* 3-chart row */}
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <RevenueChart data={revenue} />
        <OrderStatusDonut counts={orderStatusCounts} />
        <RefundDiscountBars refundCount={latestRefundCount} discountCount={latestDiscountCount} />
      </div>

      {!revenueResult.success && (
        <p className="mb-4 text-xs text-status-cancelled">
          Couldn&apos;t load revenue report: {revenueResult.message}
        </p>
      )}

      {/* Pipeline table */}
      <div className="mb-8">
        <PipelineTable rows={pipelineRows} />
      </div>

      {/* Recent activity */}
      <div>
        <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
          Recent activity
        </p>
        <div className="flex flex-col gap-2.5">
          {activity.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
          {activity.map((item) =>
            item.kind === "order" ? (
              <OrderRow
                key={`order-${item.order.id}`}
                kind="order"
                title={`Order #${item.order.id.slice(0, 8)}`}
                subtitle={orderTitle(item.order)}
                status={ORDER_STATUS_MAP[item.order.status]}
                statusLabel={ORDER_STATUS_LABEL[item.order.status]}
              />
            ) : (
              <OrderRow
                key={`inquiry-${item.inquiry.id}`}
                kind="inquiry"
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