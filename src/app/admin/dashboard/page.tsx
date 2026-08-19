import { getSummaryReport, getRevenueReport } from "@/lib/api/reports";
import { getReviewStats } from "@/lib/api/engagement/reviews";
import { getInquiries } from "@/lib/api/engagement/inquiries";
import { getAllOrders } from "@/lib/api/orders/orders";
import { getAllAppointments } from "@/lib/api/engagement/appointments";
import { getAllRentals } from "@/lib/api/catalog/rentals";
import { getPendingProductionApprovals } from "@/lib/api/production/production";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrdersPipelineBoard } from "@/components/dashboard/orders-pipeline-board";
import { WalkInSaleTrigger } from "@/components/admin/walkin-sale-trigger";
import { WeekCalendarCard } from "@/components/admin/week-calendar-card";
import { DollarSign, ShoppingBag, Shirt, MessageSquare } from "lucide-react";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

// Revenue trend = latest month vs previous month in revenueData.
// Only the revenue KPI gets a trend badge — orders/rentals/inquiries
// have no historical series available yet, so they render without one.
function getRevenueTrend(
  revenueData: { month: string; totalRevenue: number }[],
): { value: string; direction: "up" | "down" } | undefined {
  if (revenueData.length < 2) return undefined;
  const sorted = [...revenueData].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1].totalRevenue;
  const previous = sorted[sorted.length - 2].totalRevenue;
  if (previous === 0) return undefined;
  const pctChange = ((latest - previous) / previous) * 100;
  const direction: "up" | "down" = pctChange >= 0 ? "up" : "down";
  return { value: `${Math.abs(pctChange).toFixed(0)}%`, direction };
}

export default async function AdminDashboard() {
  const [
    summaryResult,
    revenueResult,
    reviewStatsResult,
    inquiriesResult,
    ordersResult,
    appointmentsResult,
    rentalsResult,
    productionApprovalsResult,
  ] = await Promise.all([
    getSummaryReport(),
    getRevenueReport(),
    getReviewStats(),
    getInquiries(),
    getAllOrders(),
    getAllAppointments(),
    getAllRentals(),
    getPendingProductionApprovals(),
  ]);

  const totalRevenue = summaryResult.success ? summaryResult.data.totalRevenue : 0;
  const revenueData = revenueResult.success ? revenueResult.data : [];
  const revenueTrend = getRevenueTrend(revenueData);
  const pendingReviews = reviewStatsResult.success ? reviewStatsResult.data.pendingReviews : 0;

  const openInquiriesCount = inquiriesResult.success
    ? inquiriesResult.data.filter((i) => i.status === "OPEN").length
    : 0;

  const allOrders = ordersResult.success ? ordersResult.data : [];

  const newOrdersCount = allOrders.filter((o) => o.status === "PENDING").length;

  const cashPaymentsToConfirm = allOrders.filter(
    (o) => o.status === "PENDING" && o.paymentMethod === "CASH",
  ).length;

  const activeRentals = rentalsResult.success
    ? rentalsResult.data.filter((r) => r.status === "ACTIVE")
    : [];

  const productionApprovalsCount = productionApprovalsResult.success
    ? productionApprovalsResult.data.length
    : 0;

  const attentionItems = [
    {
      key: "new-orders",
      count: newOrdersCount,
      label: "New orders",
      href: "/admin/orders?status=PENDING",
      accent: "border-primary",
    },
    {
      key: "reviews",
      count: pendingReviews,
      label: "Reviews pending",
      href: "/admin/bookings?tab=reviews",
      accent: "border-status-pending",
    },
    {
      key: "production",
      count: productionApprovalsCount,
      label: "Production approvals",
      href: "/admin/orders",
      accent: "border-status-progress",
    },
    {
      key: "cash",
      count: cashPaymentsToConfirm,
      label: "Cash payments to confirm",
      href: "/admin/orders?status=PENDING",
      accent: "border-status-completed",
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ---------- KPI row ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            color="revenue"
            trend={revenueTrend}
          />
          <StatCard label="New orders" value={String(newOrdersCount)} icon={ShoppingBag} color="orders" />
          <StatCard label="Active rentals" value={String(activeRentals.length)} icon={Shirt} color="rentals" />
          <StatCard label="Open inquiries" value={String(openInquiriesCount)} icon={MessageSquare} color="inquiries" />
        </div>
        <div className="shrink-0">
          <WalkInSaleTrigger />
        </div>
      </div>

      {/* ---------- Needs attention strip (kept, only shows if non-empty) ---------- */}
      {attentionItems.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {attentionItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`rounded-lg border-l-2 ${item.accent} bg-card py-2.5 pl-4 pr-4 shadow-[var(--shadow-card)] transition-colors hover:bg-accent/40`}
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-base font-medium text-foreground">
                {item.count}
                <span className="ml-2 text-xs font-normal text-primary">Review →</span>
              </p>
            </a>
          ))}
        </div>
      )}

      {/* ---------- Calendar + Revenue ---------- */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr]">
        <WeekCalendarCard appointments={appointmentsResult.success ? appointmentsResult.data : []} />
        <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="font-heading text-base font-medium text-foreground">Revenue</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-3">
            <RevenueChart data={revenueData} />
          </div>
        </div>
      </div>

      {/* ---------- Orders pipeline board (fills remaining height) ---------- */}
      <OrdersPipelineBoard orders={allOrders} />
    </div>
  );
}