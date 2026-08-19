import type { LucideIcon } from "lucide-react";

type StatColor = "revenue" | "orders" | "rentals" | "inquiries" | "neutral";

const COLOR_CLASSES: Record<StatColor, { bg: string; fg: string }> = {
  revenue: { bg: "bg-stat-revenue-bg", fg: "text-stat-revenue-fg" },
  orders: { bg: "bg-stat-orders-bg", fg: "text-stat-orders-fg" },
  rentals: { bg: "bg-stat-rentals-bg", fg: "text-stat-rentals-fg" },
  inquiries: { bg: "bg-stat-inquiries-bg", fg: "text-stat-inquiries-fg" },
  neutral: { bg: "bg-primary/10", fg: "text-primary" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "neutral",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" };
  color?: StatColor;
}) {
  const { bg, fg } = COLOR_CLASSES[color];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && (
          <div className={`rounded-lg ${bg} p-2`}>
            <Icon className={`h-4 w-4 ${fg}`} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.direction === "up"
                ? "bg-status-completed/15 text-status-completed"
                : "bg-status-cancelled/15 text-status-cancelled"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}