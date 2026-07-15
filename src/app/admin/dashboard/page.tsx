import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { WalkInSaleTrigger } from "@/components/admin/walkin-sale-trigger";
import { WeekCalendarCard } from "@/components/admin/week-calendar-card";

// ─────────────────────────────────────────────────────────────────────────
// ALL DUMMY DATA — swap for real lib/api/* calls once layout is confirmed.
// Shapes mirror the real report/order/rental/inquiry types so the swap
// is mechanical.
// ─────────────────────────────────────────────────────────────────────────

const DUMMY_SUMMARY = {
  totalRevenue: 486500,
  completedOrderCount: 12,
  refundCount: 1,
  discountedOrderCount: 3,
};

const DUMMY_REVENUE = [
  { month: "2026-02", totalRevenue: 62000, orderCount: 2 },
  { month: "2026-03", totalRevenue: 148000, orderCount: 3 },
  { month: "2026-04", totalRevenue: 95000, orderCount: 2 },
  { month: "2026-05", totalRevenue: 210000, orderCount: 4 },
  { month: "2026-06", totalRevenue: 176000, orderCount: 3 },
  { month: "2026-07", totalRevenue: 486500, orderCount: 12 },
];

// Attention strip — small, quiet, action-only items without their own card
const DUMMY_ATTENTION = {
  pendingReviews: 4,
  productionApprovals: 2,
  cashPaymentsToConfirm: 3,
};

const DUMMY_ORDERS_BREAKDOWN = [
  { label: "Custom in production", count: 7 },
  { label: "To be shipped", count: 5 },
  { label: "To be picked up", count: 3 },
];

const DUMMY_RENTALS = {
  overdue: [
    { id: "r1", customerName: "Dilki Fernando", productName: "Ivory Chapel Train", note: "Overdue by 2 days" },
  ],
  dueSoon: [
    { id: "r2", customerName: "Nethmi Silva", productName: "Aurora Lace Mermaid Gown", note: "Due in 2 days" },
    { id: "r3", customerName: "Shanika Rathnayake", productName: "Blush A-line", note: "Due in 4 days" },
  ],
};

const DUMMY_INQUIRIES = [
  { id: "i1", name: "Nadeesha K.", snippet: "Do you have this in ivory?", time: "2h ago" },
  { id: "i2", name: "Ruwan de Silva", snippet: "Pricing for the rental package?", time: "5h ago" },
  { id: "i3", name: "Amaya Perera", snippet: "Looking for something with a cathedral train...", time: "1d ago" },
];

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export default function AdminDashboard() {
  const summary = DUMMY_SUMMARY;

  const attentionItems = [
    {
      key: "reviews",
      count: DUMMY_ATTENTION.pendingReviews,
      label: "Reviews pending",
      href: "/admin/reviews",
      accent: "border-status-pending",
    },
    {
      key: "production",
      count: DUMMY_ATTENTION.productionApprovals,
      label: "Production approvals",
      href: "/admin/orders",
      accent: "border-status-progress",
    },
    {
      key: "cash",
      count: DUMMY_ATTENTION.cashPaymentsToConfirm,
      label: "Cash payments to confirm",
      href: "/admin/payments",
      accent: "border-status-completed",
    },
  ].filter((item) => item.count > 0);

  return (
    <div>
      {/* Attention strip + Quick Sale, all in one row on desktop, stacked on mobile */}
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

      {/* Calendar + Revenue, side by side */}
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr]">
        <WeekCalendarCard />
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading text-[15px] font-medium text-foreground">Revenue</p>
          <p className="mt-1 text-xl font-medium tabular-nums text-foreground">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <div className="mt-3">
            <RevenueChart data={DUMMY_REVENUE} />
          </div>
        </div>
      </div>

      {/* Orders / Rentals / Inquiries — the core "what needs action" row */}
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-[15px] font-medium text-foreground">Orders</p>
          <div className="flex flex-col gap-2.5">
            {DUMMY_ORDERS_BREAKDOWN.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-[15px] font-medium text-foreground">Rentals</p>
          {DUMMY_RENTALS.overdue.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-medium text-status-cancelled">Overdue</p>
              <div className="mb-3 flex flex-col gap-1.5">
                {DUMMY_RENTALS.overdue.map((r) => (
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
          <div className="flex flex-col gap-1.5">
            {DUMMY_RENTALS.dueSoon.map((r) => (
              <div key={r.id} className="text-xs">
                <span className="font-medium text-foreground">{r.productName}</span>
                <span className="text-muted-foreground"> · {r.customerName} · {r.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-[15px] font-medium text-foreground">New inquiries</p>
            <a href="/admin/requests/inquiries" className="text-[11px] text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            {DUMMY_INQUIRIES.map((inq) => (
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