import { StatusBadge, type Status } from "./status-badge";

export function OrderRow({
  title,
  subtitle,
  status,
  statusLabel,
}: {
  title: string;
  subtitle: string;
  status: Status;
  statusLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
      <div>
        <p className="mb-1 text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <StatusBadge status={status}>{statusLabel}</StatusBadge>
    </div>
  );
}