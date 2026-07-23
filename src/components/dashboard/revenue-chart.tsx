"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export function RevenueChart({ data }: { data: RevenueReportItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground">No revenue data yet.</p>
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalRevenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}