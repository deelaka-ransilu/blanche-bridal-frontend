import { getMyOrders } from "@/lib/api/orders";
import { getMyAppointments } from "@/lib/api/appointments";
import { getMyRentals } from "@/lib/api/rentals";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

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

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const RECENT_ORDER_LIMIT = 3;

// ---- helpers ------------------------------------------------------------

function orderSubtitle(order: Order): string {
  return order.items.length > 0
    ? order.items.length === 1
      ? order.items[0].productName
      : `${order.items[0].productName} +${order.items.length - 1} more`
    : "No items";
}

function sortByCreatedAtDesc<T extends { createdAt: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Nearest upcoming appointment: not cancelled, date today-or-later, earliest first.
function nextUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = appointments
    .filter((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED")
    .filter((a) => new Date(a.appointmentDate) >= today)
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return upcoming[0] ?? null;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `Rs ${amount}`;
}

function formatAppointmentDate(dateStr: string, timeSlot: string): string {
  const date = new Date(dateStr);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekday}, ${monthDay} · ${timeSlot}`;
}

// ---------------------------------------------------------------------

export default async function MyDashboard() {
  const [ordersResult, appointmentsResult, rentalsResult] = await Promise.all([
    getMyOrders(),
    getMyAppointments(),
    getMyRentals(),
  ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  const appointments = appointmentsResult.success ? appointmentsResult.data : [];
  const rentals = rentalsResult.success ? rentalsResult.data : [];

  const recentOrders = sortByCreatedAtDesc(orders).slice(0, RECENT_ORDER_LIMIT);
  const nextAppointment = nextUpcomingAppointment(appointments);

  // "Due" = sum of balanceDue across this customer's rentals (Order has no
  // paid/due split -- see flag in chat). Nulls treated as 0, not skipped,
  // since a null balanceDue on an active rental would otherwise silently
  // under-report what's owed.
  const totalDue = rentals.reduce((sum, r) => sum + (r.balanceDue ?? 0), 0);

  return (
    <>
      <div className="mb-6 rounded-3xl bg-[#1A1A1A] p-4 dark:bg-card">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Orders" value={String(orders.length)} variant="dark" />
          <StatCard
            label="Next fitting"
            variant="dark"
            value={
              nextAppointment
                ? new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }
          />
          <StatCard label="Due" value={formatCurrency(totalDue)} variant="dark" />
        </div>
      </div>

      {(!ordersResult.success || !appointmentsResult.success || !rentalsResult.success) && (
        <p className="mb-4 text-xs text-status-cancelled">
          Some information couldn&apos;t be loaded. Pull to refresh or try again shortly.
        </p>
      )}

      <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
        Recent orders
      </p>
      <div className="mb-6 flex flex-col gap-2.5">
        {recentOrders.length === 0 && (
          <p className="text-xs text-muted-foreground">No orders yet.</p>
        )}
        {recentOrders.map((order) => (
          <OrderRow
            key={order.id}
            title={`Order #${order.id.slice(0, 8)}`}
            subtitle={orderSubtitle(order)}
            status={ORDER_STATUS_MAP[order.status]}
            statusLabel={ORDER_STATUS_LABEL[order.status]}
          />
        ))}
      </div>

      <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
        Upcoming appointment
      </p>
      {nextAppointment ? (
        <OrderRow
          title={
            nextAppointment.type === "FITTING"
              ? "Fitting"
              : nextAppointment.type === "RENTAL_PICKUP"
                ? "Rental pickup"
                : "Purchase"
          }
          subtitle={formatAppointmentDate(nextAppointment.appointmentDate, nextAppointment.timeSlot)}
          status={APPOINTMENT_STATUS_MAP[nextAppointment.status]}
          statusLabel={APPOINTMENT_STATUS_LABEL[nextAppointment.status]}
        />
      ) : (
        <p className="text-xs text-muted-foreground">No upcoming appointments.</p>
      )}
    </>
  );
}