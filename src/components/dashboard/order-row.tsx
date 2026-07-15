import { Package, MessageSquare } from "lucide-react";
import { StatusBadge, type Status } from "./status-badge";

export function OrderRow({
  title,
  subtitle,
  status,
  statusLabel,
  kind = "order",
}: {
  title: string;
  subtitle: string;
  status: Status;
  statusLabel: string;
  kind?: "order" | "inquiry";
}) {
  const Icon = kind === "order" ? Package : MessageSquare;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <StatusBadge status={status}>{statusLabel}</StatusBadge>
    </div>
  );
}