import {
  getSummaryReport,
  getRevenueReport,
  getRefundReport,
  getDiscountReport,
} from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";

// Next 16 async searchParams convention.
interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  // reports.ts resolves the session/token internally (matches lib/api/orders.ts's
  // getToken() pattern) -- no need to extract a token here or pass it through.
  const [summary, revenue, refunds, discounts] = await Promise.all([
    getSummaryReport(from, to),
    getRevenueReport(from, to),
    getRefundReport(from, to),
    getDiscountReport(from, to),
  ]);

  // Per FRONTEND_HANDOVER_V2.md: list pages show inline error on !success.
  if (!summary.success || !revenue.success || !refunds.success || !discounts.success) {
    const message =
      (!summary.success && summary.message) ||
      (!revenue.success && revenue.message) ||
      (!refunds.success && refunds.message) ||
      (!discounts.success && discounts.message) ||
      "Failed to load reports.";
    return (
      <div className="rounded-xl border border-[#E5DCD0] bg-white p-6 text-sm text-[#9A8B82]">
        {message}
      </div>
    );
  }

  const summaryData = summary.data;
  const revenueData = revenue.data;
  const refundsData = refunds.data;
  const discountsData = discounts.data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-outfit font-semibold text-[#3A2E2A] dark:text-[#F0EAE0]">
          Financial Reports
        </h1>
      </div>

      {/* Date range picker -- native GET form, no client JS needed.
          Submitting re-navigates with ?from=&to=, which re-runs this
          Server Component with the new range. */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-xl border border-[#E5DCD0] bg-white/60 p-4 dark:border-[#3A322C] dark:bg-white/5"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-sm text-[#6B5C54] dark:text-[#C9BBB0]">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={summaryData.from}
            className="rounded-md border border-[#E5DCD0] px-3 py-1.5 text-sm dark:border-[#3A322C] dark:bg-[#241F1C] dark:text-[#F0EAE0]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-sm text-[#6B5C54] dark:text-[#C9BBB0]">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={summaryData.to}
            className="rounded-md border border-[#E5DCD0] px-3 py-1.5 text-sm dark:border-[#3A322C] dark:bg-[#241F1C] dark:text-[#F0EAE0]"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-[#D2335E] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#B82A50]"
        >
          Apply
        </button>
        <span className="text-xs text-[#9A8B82] dark:text-[#8A7B72]">
          Defaults to trailing 12 months if left blank.
        </span>
      </form>

      {/* Summary cards -- kept as plain cards rather than the shared
          stat-card component since its exact prop shape wasn't confirmed
          for this session; swap in <StatCard /> here if it matches. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          label="Total Revenue"
          value={formatCurrency(summaryData.totalRevenue)}
          sub={`${summaryData.completedOrderCount} completed orders`}
        />
        <SummaryCard
          label="Total Refunded"
          value={formatCurrency(summaryData.totalRefunded)}
          sub={`${summaryData.refundCount} refunds`}
        />
        <SummaryCard
          label="Discounted Orders"
          value={String(summaryData.discountedOrderCount)}
        />
        <SummaryCard
          label="Fixed Discounts"
          value={formatCurrency(summaryData.totalFixedDiscountAmount)}
        />
        <SummaryCard
          label="% Discount Orders"
          value={String(summaryData.percentageDiscountOrderCount)}
        />
      </div>

      <div className="text-xs text-[#9A8B82] dark:text-[#8A7B72]">
        Window: {formatDate(summaryData.from)} – {formatDate(summaryData.to)}
      </div>

      {/* Revenue */}
      <ReportTable
        title="Revenue by Month"
        columns={["Month", "Total Revenue", "Order Count"]}
        rows={revenueData.map((r) => [
          r.month,
          formatCurrency(r.totalRevenue),
          String(r.orderCount),
        ])}
        emptyLabel="No completed orders in this range."
      />

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

      {/* Discounts -- FIXED and PERCENTAGE kept as separate columns,
          never blended into one number (see types/report.ts comment). */}
      <ReportTable
        title="Discounts by Month"
        columns={[
          "Month",
          "Fixed Orders",
          "Total Fixed Amount",
          "% Orders",
          "Avg % Discount",
        ]}
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
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5DCD0] bg-white p-4">
      <div className="text-xs text-[#9A8B82]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[#3A2E2A]">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[#9A8B82]">{sub}</div>}
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
    <div className="rounded-xl border border-[#E5DCD0] bg-white">
      <div className="border-b border-[#E5DCD0] px-4 py-3 font-medium text-[#3A2E2A]">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-sm text-[#9A8B82]">{emptyLabel}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#9A8B82]">
              {columns.map((c) => (
                <th key={c} className="px-4 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[#F0EAE0]">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-[#3A2E2A]">
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