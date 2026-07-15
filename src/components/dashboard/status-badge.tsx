import { Clock, Loader2, Check, X } from "lucide-react";

export type Status = "pending" | "progress" | "completed" | "cancelled";

const ICON: Record<Status, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  progress: Loader2,
  completed: Check,
  cancelled: X,
};

const STYLE: Record<Status, string> = {
  pending: "bg-status-pending/15 text-status-pending",
  progress: "bg-status-progress/15 text-status-progress",
  completed: "bg-status-completed/15 text-status-completed",
  cancelled: "bg-status-cancelled/15 text-status-cancelled",
};

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  const Icon = ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${STYLE[status]}`}
    >
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}