import { updateOrderStatusAction } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/order";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const action = updateOrderStatusAction.bind(null, orderId);

  return (
    <form action={action} className="flex items-center gap-2">
      {/* key={currentStatus} forces React to remount this <select> whenever
          currentStatus actually changes (e.g. after updateOrderStatusAction
          revalidates the page, or after confirm-cash flips PENDING -> CONFIRMED).
          defaultValue is uncontrolled -- without the key, React reuses the same
          DOM node across re-renders and never re-applies defaultValue, so the
          dropdown silently goes stale relative to the (correctly updating)
          status badge next to it. See CURRENT_STATE.md session 22/24 findings. */}
      <select
        key={currentStatus}
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        Update status
      </button>
    </form>
  );
}