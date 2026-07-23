import { TrendingUp, RotateCcw, Tag } from "lucide-react";
import {
  getSummaryReport,
  getRevenueReport,
  getRefundReport,
  getDiscountReport,
} from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueReportChart } from "@/components/reports/revenue-report-chart";
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
    <div className="flex flex-col gap-5 p-1">
      {/* Header + date range */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">Financial Reports</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(summaryData.from)} – {formatDate(summaryData.to)}
          </p>
        </div>

        <form
          method="get"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
        >
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={summaryData.from}
            aria-label="From"
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={summaryData.to}
            aria-label="To"
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm">
            Apply
          </Button>
        </form>

      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        <DiscountsSummaryCard
          discountedOrderCount={summaryData.discountedOrderCount}
          totalFixedDiscountAmount={summaryData.totalFixedDiscountAmount}
          percentageDiscountOrderCount={summaryData.percentageDiscountOrderCount}
        />
      </div>

      {/* Chart: full width */}
      <RevenueReportChart data={revenueData} />

      {/* Tables: side by side below the chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
    <div className="relative rounded-2xl border border-border bg-card p-4 pt-3">
      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="pr-10">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-lg font-semibold text-foreground">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function DiscountsSummaryCard({
  discountedOrderCount,
  totalFixedDiscountAmount,
  percentageDiscountOrderCount,
}: {
  discountedOrderCount: number;
  totalFixedDiscountAmount: number;
  percentageDiscountOrderCount: number;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 pt-3">
      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Tag className="h-4 w-4" />
      </div>
      <div className="pr-10">
        <div className="text-xs text-muted-foreground">Discounted Orders</div>
        <div className="mt-0.5 text-lg font-semibold text-foreground">{discountedOrderCount}</div>
      </div>
      <div className="mt-2 flex flex-col gap-0.5 border-t border-border pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Fixed discounts</span>
          <span className="text-foreground">{formatCurrency(totalFixedDiscountAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">% discount orders</span>
          <span className="text-foreground">{percentageDiscountOrderCount}</span>
        </div>
      </div>
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
      <div className="border-b border-border px-4 py-2.5 font-heading text-[15px] font-medium text-foreground">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
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