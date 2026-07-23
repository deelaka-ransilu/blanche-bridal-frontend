"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenueReportItem } from "@/types/report";

function formatMonth(month: string): string {
  // "2026-07" -> "Jul"
  const [, m] = month.split("-");
  const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[Number(m)] ?? month;
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toLocaleString("en-LK", { maximumFractionDigits: 1 })}k`;
  return String(amount);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: RevenueReportItem }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-[11px] text-muted-foreground">{formatMonth(label ?? "")}</p>
      <p className="text-sm font-medium text-foreground">{formatCurrency(item.totalRevenue)}</p>
      <p className="text-[11px] text-muted-foreground">
        {item.orderCount} order{item.orderCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function RevenueReportChart({ data }: { data: RevenueReportItem[] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <div className="mb-4">
        <p className="font-heading text-[15px] font-medium text-foreground">Revenue Trend</p>
        <p className="text-xs text-muted-foreground">Completed order revenue by month</p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-border/60">
          <p className="text-xs text-muted-foreground">No revenue data in this range.</p>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrencyShort}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}