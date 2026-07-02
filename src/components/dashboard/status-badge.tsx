export type Status = "pending" | "progress" | "completed" | "cancelled";

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  const map: Record<Status, string> = {
    pending: "bg-status-pending/15 text-status-pending",
    progress: "bg-status-progress/15 text-status-progress",
    completed: "bg-status-completed/15 text-status-completed",
    cancelled: "bg-status-cancelled/15 text-status-cancelled",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map[status]}`}>
      {children}
    </span>
  );
}