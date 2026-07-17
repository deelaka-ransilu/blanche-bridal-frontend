import { getSummaryReport, getRevenueReport } from "@/lib/api/reports";
import { getReviewStats } from "@/lib/api/reviews";
import { getInquiries } from "@/lib/api/inquiries";
import { getAllOrders } from "@/lib/api/orders";
import { getAllAppointments } from "@/lib/api/appointments";
import { getAllRentals } from "@/lib/api/rentals";
import { getPendingProductionApprovals } from "@/lib/api/production";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { WalkInSaleTrigger } from "@/components/admin/walkin-sale-trigger";
import { WeekCalendarCard } from "@/components/admin/week-calendar-card";
import type { OrderStatus } from "@/types/order";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

function getThisWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const day = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function AdminDashboard() {
  const { start: weekStart, end: weekEnd } = getThisWeekRange();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const pendingReviews = reviewStatsResult.success ? reviewStatsResult.data.pendingReviews : 0;

  const recentInquiries = inquiriesResult.success
    ? inquiriesResult.data
        .filter((i) => i.status === "OPEN")
        .slice(0, 3)
        .map((i) => ({
          id: i.id,
          name: i.name,
          snippet: i.subject || i.message,
          time: new Date(i.createdAt).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
        }))
    : [];

  const allOrders = ordersResult.success ? ordersResult.data : [];

  const cashPaymentsToConfirm = allOrders.filter(
    (o) => o.status === "PENDING" && o.paymentMethod === "CASH",
  ).length;

  const ordersByStatus = (status: OrderStatus) => allOrders.filter((o) => o.status === status).length;
  const ordersBreakdown = [
    { label: "Confirmed — in production", count: ordersByStatus("CONFIRMED") + ordersByStatus("PROCESSING") },
    {
      label: "Ready — to be shipped",
      count: allOrders.filter((o) => o.status === "READY" && o.fulfillmentMethod === "DELIVERY").length,
    },
    {
      label: "Ready — to be picked up",
      count: allOrders.filter((o) => o.status === "READY" && o.fulfillmentMethod === "PICKUP").length,
    },
  ];

  const thisWeekAppointments = appointmentsResult.success
    ? appointmentsResult.data.filter((a) => {
        const d = new Date(a.appointmentDate + "T00:00:00");
        return d >= weekStart && d <= weekEnd && a.status !== "CANCELLED";
      })
    : [];

  // Rentals: overdue = ACTIVE past rentalEnd; due soon = ACTIVE within next 5 days.
  // Field names (status/rentalEnd/productName/customerName) assumed from
  // codebase conventions -- adjust if types/rental.ts differs.
  const activeRentals = rentalsResult.success
    ? rentalsResult.data.filter((r) => r.status === "ACTIVE")
    : [];

  const overdueRentals = activeRentals
    .filter((r) => new Date(r.rentalEnd) < today)
    .map((r) => ({
      id: r.id,
      customerName: r.customerName ?? "Unknown",
      productName: r.productName ?? "Unknown item",
      note: `Overdue by ${daysBetween(today, new Date(r.rentalEnd))} day${
        daysBetween(today, new Date(r.rentalEnd)) === 1 ? "" : "s"
      }`,
    }));

  const dueSoonRentals = activeRentals
    .filter((r) => {
      const end = new Date(r.rentalEnd);
      const diff = daysBetween(end, today);
      return diff >= 0 && diff <= 5;
    })
    .map((r) => ({
      id: r.id,
      customerName: r.customerName ?? "Unknown",
      productName: r.productName ?? "Unknown item",
      note: `Due in ${daysBetween(new Date(r.rentalEnd), today)} day${
        daysBetween(new Date(r.rentalEnd), today) === 1 ? "" : "s"
      }`,
    }));

  const productionApprovalsCount = productionApprovalsResult.success
    ? productionApprovalsResult.data.length
    : 0;

  const attentionItems = [
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
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          {attentionItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`rounded-lg border-l-2 ${item.accent} bg-card py-2.5 pl-4 pr-4 transition-colors hover:bg-accent/40`}
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-lg font-medium text-foreground">
                {item.count}
                <span className="ml-2 text-xs font-normal text-primary">Review →</span>
              </p>
            </a>
          ))}
        </div>
        <div className="flex shrink-0">
          <WalkInSaleTrigger />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr]">
        <WeekCalendarCard />
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading text-[15px] font-medium text-foreground">Revenue</p>
          <p className="mt-1 text-xl font-medium tabular-nums text-foreground">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-3">
            <RevenueChart data={revenueData} />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-[15px] font-medium text-foreground">Orders</p>
          <div className="flex flex-col gap-2.5">
            {ordersBreakdown.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-[15px] font-medium text-foreground">Rentals</p>
          {overdueRentals.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-medium text-status-cancelled">Overdue</p>
              <div className="mb-3 flex flex-col gap-1.5">
                {overdueRentals.map((r) => (
                  <div key={r.id} className="text-xs">
                    <span className="font-medium text-foreground">{r.productName}</span>
                    <span className="text-muted-foreground"> · {r.customerName}</span>
                    <p className="text-status-cancelled">{r.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Due soon</p>
          {dueSoonRentals.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing due in the next 5 days.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {dueSoonRentals.map((r) => (
                <div key={r.id} className="text-xs">
                  <span className="font-medium text-foreground">{r.productName}</span>
                  <span className="text-muted-foreground"> · {r.customerName} · {r.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-[15px] font-medium text-foreground">New inquiries</p>
            <a href="/admin/bookings?tab=inquiries" className="text-[11px] text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentInquiries.length === 0 && (
              <p className="text-xs text-muted-foreground">No open inquiries.</p>
            )}
            {recentInquiries.map((inq) => (
              <div key={inq.id}>
                <p className="text-xs font-medium text-foreground">{inq.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {inq.snippet} · {inq.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}