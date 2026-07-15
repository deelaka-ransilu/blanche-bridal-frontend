import { TrendingUp, TrendingDown, Percent, RotateCcw, Tag } from "lucide-react";
import {
  getSummaryReport,
  getRevenueReport,
  getRefundReport,
  getDiscountReport,
} from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  const [summary, revenue, refunds, discounts] = await Promise.all([
    getSummaryReport(from, to),
    getRevenueReport(from, to),
    getRefundReport(from, to),
    getDiscountReport(from, to),
  ]);

  if (!summary.success || !revenue.success || !refunds.success || !discounts.success) {
    const message =
      (!summary.success && summary.message) ||
      (!revenue.success && revenue.message) ||
      (!refunds.success && refunds.message) ||
      (!discounts.success && discounts.message) ||
      "Failed to load reports.";
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-destructive">
        {message}
      </div>
    );
  }

  const summaryData = summary.data;
  const revenueData = revenue.data;
  const refundsData = refunds.data;
  const discountsData = discounts.data;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Financial Reports</h1>

      {/* Date range picker */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs text-muted-foreground">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={summaryData.from}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs text-muted-foreground">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={summaryData.to}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit" size="sm">
          Apply
        </Button>
        <span className="text-xs text-muted-foreground">
          Defaults to trailing 12 months if left blank.
        </span>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Revenue"
          value={formatCurrency(summaryData.totalRevenue)}
          sub={`${summaryData.completedOrderCount} completed orders`}
        />
        <SummaryCard
          icon={<RotateCcw className="h-4 w-4" />}
          label="Total Refunded"
          value={formatCurrency(summaryData.totalRefunded)}
          sub={`${summaryData.refundCount} refunds`}
        />
        <SummaryCard
          icon={<Tag className="h-4 w-4" />}
          label="Discounted Orders"
          value={String(summaryData.discountedOrderCount)}
        />
        <SummaryCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Fixed Discounts"
          value={formatCurrency(summaryData.totalFixedDiscountAmount)}
        />
        <SummaryCard
          icon={<Percent className="h-4 w-4" />}
          label="% Discount Orders"
          value={String(summaryData.percentageDiscountOrderCount)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Window: {formatDate(summaryData.from)} – {formatDate(summaryData.to)}
      </p>

      {/* Revenue chart */}
      <RevenueChart data={revenueData} />

      {/* Refunds */}
      <ReportTable
        title="Refunds by Month"
        columns={["Month", "Total Refunded", "Refund Count"]}
        rows={refundsData.map((r) => [
          r.month,
          formatCurrency(r.totalRefunded),
          String(r.refundCount),
        ])}
        emptyLabel="No refunds in this range."
      />

      {/* Discounts */}
      <ReportTable
        title="Discounts by Month"
        columns={["Month", "Fixed Orders", "Total Fixed Amount", "% Orders", "Avg % Discount"]}
        rows={discountsData.map((d) => [
          d.month,
          String(d.fixedDiscountOrderCount),
          formatCurrency(d.totalFixedDiscountAmount),
          String(d.percentageDiscountOrderCount),
          `${d.averagePercentageDiscount}%`,
        ])}
        emptyLabel="No discounted orders in this range."
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ReportTable({
  title,
  columns,
  rows,
  emptyLabel,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  emptyLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 font-heading text-[15px] font-medium text-foreground">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyLabel}</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-primary/5">
            <tr className="text-left">
              {columns.map((c) => (
                <th
                  key={c}
                  className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}