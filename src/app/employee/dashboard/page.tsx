import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllOrders } from "@/lib/api/orders";
import { getAllRentals } from "@/lib/api/rentals";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Rental, RentalStatus } from "@/types/rental";

// ---- status mapping helpers -------------------------------------------

const ORDER_STATUS_MAP: Record<OrderStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  PROCESSING: "progress",
  READY: "progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// NOTE: OVERDUE mapped to "cancelled" bucket (red) purely to stand out --
// there's no dedicated "warning" status color in StatusBadge today. Flagged
// for review -- if this reads as confusing next to genuinely cancelled
// rentals, the fix is a 5th color added to StatusBadge/Status globally,
// not a workaround here.
const RENTAL_STATUS_MAP: Record<RentalStatus, Status> = {
  PENDING_PAYMENT: "pending",
  BOOKED: "progress",
  ACTIVE: "progress",
  OVERDUE: "cancelled",
  RETURNED: "completed",
  CANCELLED: "cancelled",
};

const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  BOOKED: "Booked",
  ACTIVE: "Active",
  OVERDUE: "Overdue",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

const RECENT_LIMIT = 5;

// ---- helpers ------------------------------------------------------------

function orderTitle(order: Order): string {
  const first = order.customerFirstName ?? "";
  const last = order.customerLastName ?? "";
  const name = `${first} ${last}`.trim() || order.customerEmail || "Unknown customer";
  const itemSummary =
    order.items.length > 0
      ? order.items.length === 1
        ? order.items[0].productName
        : `${order.items[0].productName} +${order.items.length - 1} more`
      : "No items";
  return `${name} · ${itemSummary}`;
}

function rentalSubtitle(rental: Rental): string {
  const name = rental.customerName ?? rental.customerEmail ?? "Unknown customer";
  const product = rental.productName ?? "Unknown item";
  return `${name} · ${product}`;
}

// Order.createdAt can be null (known backend bug -- see CURRENT_STATE.md);
// Rental.createdAt is always a string per types/rental.ts, so this only
// needs to guard the Order side, but kept generic for reuse.
function sortByCreatedAtDesc<T extends { createdAt: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// ---------------------------------------------------------------------

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [ordersResult, rentalsResult] = await Promise.all([
    getAllOrders(),
    getAllRentals(),
  ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  const rentals = rentalsResult.success ? rentalsResult.data : [];

  const pendingOrderCount = orders.filter((o) => o.status === "PENDING").length;
  const activeRentalCount = rentals.filter((r) => r.status === "ACTIVE").length;
  const overdueRentalCount = rentals.filter((r) => r.status === "OVERDUE").length;

  const recentOrders = sortByCreatedAtDesc(orders).slice(0, RECENT_LIMIT);
  // Rental.createdAt is a plain string (never null), so a straight sort works
  const recentRentals = [...rentals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_LIMIT);

  return (
    <div>
      <div className="mb-6">
        <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-xl font-medium text-foreground">
          Hi, {firstName}
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total orders" value={String(orders.length)} />
        <StatCard label="Pending orders" value={String(pendingOrderCount)} />
        <StatCard label="Active rentals" value={String(activeRentalCount)} />
        <StatCard label="Overdue rentals" value={String(overdueRentalCount)} />
      </div>

      {(!ordersResult.success || !rentalsResult.success) && (
        <p className="mb-4 text-xs text-status-cancelled">
          {!ordersResult.success && `Couldn't load orders: ${ordersResult.message}. `}
          {!rentalsResult.success && `Couldn't load rentals: ${rentalsResult.message}.`}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent orders
          </p>
          <div className="flex flex-col gap-2.5">
            {recentOrders.length === 0 && (
              <p className="text-xs text-muted-foreground">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <OrderRow
                key={order.id}
                title={`Order #${order.id.slice(0, 8)}`}
                subtitle={orderTitle(order)}
                status={ORDER_STATUS_MAP[order.status]}
                statusLabel={ORDER_STATUS_LABEL[order.status]}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent rentals
          </p>
          <div className="flex flex-col gap-2.5">
            {recentRentals.length === 0 && (
              <p className="text-xs text-muted-foreground">No rentals yet.</p>
            )}
            {recentRentals.map((rental) => (
              <OrderRow
                key={rental.id}
                title={`Rental #${rental.id.slice(0, 8)}`}
                subtitle={rentalSubtitle(rental)}
                status={RENTAL_STATUS_MAP[rental.status]}
                statusLabel={RENTAL_STATUS_LABEL[rental.status]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}