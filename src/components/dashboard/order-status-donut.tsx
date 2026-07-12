"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { OrderStatus } from "@/types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "var(--status-pending)",
  CONFIRMED: "var(--status-progress)",
  PROCESSING: "var(--status-progress)",
  READY: "var(--status-progress)",
  COMPLETED: "var(--status-completed)",
  CANCELLED: "var(--status-cancelled)",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderStatusDonut({ counts }: { counts: Record<OrderStatus, number> }) {
  const data = (Object.keys(counts) as OrderStatus[])
    .filter((status) => counts[status] > 0)
    .map((status) => ({
      status,
      label: STATUS_LABEL[status],
      value: counts[status],
    }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-heading text-[15px] font-medium text-foreground">Order status</p>
        <p className="mb-3 text-xs text-muted-foreground">Current split</p>
        <div className="flex h-[110px] items-center justify-center">
          <p className="text-xs text-muted-foreground">No orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading text-[15px] font-medium text-foreground">Order status</p>
      <p className="mb-3 text-xs text-muted-foreground">Current split</p>
      <div className="h-[110px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={32}
              outerRadius={45}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.status] }}
            />
            <span className="text-[11px] text-muted-foreground">
              {entry.label} · {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}