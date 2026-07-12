import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "light",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" };
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";

  return (
    <div
      className={
        dark
          ? "rounded-xl bg-white/10 p-3.5"
          : "rounded-xl border border-border bg-card p-3.5"
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <p className={`text-[11px] ${dark ? "text-[#c9c7c2]" : "text-muted-foreground"}`}>
          {label}
        </p>
        {Icon && (
          <div
            className={
              dark
                ? "rounded-md bg-white/10 p-1.5"
                : "rounded-md bg-primary/10 p-1.5"
            }
          >
            <Icon className={`h-3.5 w-3.5 ${dark ? "text-white" : "text-primary"}`} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <p className={`text-xl font-medium ${dark ? "text-white" : "text-foreground"}`}>
          {value}
        </p>
        {trend && (
          <span
            className={`text-[11px] font-medium ${
              trend.direction === "up" ? "text-status-completed" : "text-status-cancelled"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}