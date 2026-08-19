"use client";

import { useState } from "react";
import type { RevenueReportItem } from "@/types/report";

const MAX_DOT_ROWS = 12;

function formatMonth(month: string): string {
  const [, m] = month.split("-");
  const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[Number(m)] ?? month;
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export function RevenueChart({ data }: { data: RevenueReportItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground">No revenue data yet.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue), 1);
  const activeIndex = hovered ?? data.length - 1;
  const active = data[activeIndex];

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{formatMonth(active.month)}</p>
        <p className="text-sm font-medium text-foreground">
          {formatCurrency(active.totalRevenue)}
          <span className="ml-1.5 font-normal text-muted-foreground">
            · {active.orderCount} order{active.orderCount === 1 ? "" : "s"}
          </span>
        </p>
      </div>

      <div className="flex h-[220px] items-end justify-between gap-2">
        {data.map((item, i) => {
          const filledRows = Math.max(1, Math.round((item.totalRevenue / maxRevenue) * MAX_DOT_ROWS));
          const isActive = i === activeIndex;

          return (
            <button
              key={item.month}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="flex flex-1 flex-col items-center gap-2.5"
            >
              <div className="flex flex-col-reverse gap-1">
                {Array.from({ length: MAX_DOT_ROWS }).map((_, rowIdx) => (
                  <span
                    key={rowIdx}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      rowIdx < filledRows
                        ? isActive
                          ? "bg-primary"
                          : "bg-primary/40"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-[11px] ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                {formatMonth(item.month)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}