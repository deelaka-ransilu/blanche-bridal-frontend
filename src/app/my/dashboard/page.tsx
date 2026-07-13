import { getMyOrders } from "@/lib/api/orders";
import { getMyAppointments } from "@/lib/api/appointments";
import { getMyRentals } from "@/lib/api/rentals";
import { requireRole } from "@/lib/auth-guard";
import { OrderRow } from "@/components/dashboard/order-row";
import type { Status } from "@/components/dashboard/status-badge";
import type { Order, OrderStatus } from "@/types/order";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import Link from "next/link";
import { Clock, CalendarPlus } from "lucide-react";

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

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  FITTING: "Fitting",
  RENTAL_PICKUP: "Rental pickup",
  PURCHASE: "Purchase",
  CUSTOM_CONSULTATION: "Design consultation",
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

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `Rs ${amount}`;
}

// ---------------------------------------------------------------------

export default async function MyDashboard() {
  const session = await requireRole("CUSTOMER");
  const firstName = session.user?.name?.split(" ")[0] ?? "there";

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

  // Only surface a rental with an outstanding balance -- this is the one
  // place "Due" actually means something (a real rental deposit/fee),
  // rather than a generic account-balance stat nobody asked for.
  const rentalWithBalance = rentals.find((r) => (r.balanceDue ?? 0) > 0);

  const apptDate = nextAppointment ? new Date(nextAppointment.appointmentDate) : null;
  const apptMonthLabel = apptDate
    ? apptDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : null;
  const apptDayLabel = apptDate ? apptDate.getDate() : null;
  const apptDaysAway = nextAppointment ? daysUntil(nextAppointment.appointmentDate) : null;

  return (
    <>
      <div className="mb-6 mt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Welcome back
        </p>
        <h1 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl">
          Hi, {firstName}
        </h1>
      </div>

      {(!ordersResult.success || !appointmentsResult.success || !rentalsResult.success) && (
        <p className="mb-4 text-xs text-status-cancelled">
          Some information couldn&apos;t be loaded. Pull to refresh or try again shortly.
        </p>
      )}

      {/* Upcoming appointment -- the single most relevant thing to lead
          with for a bride: what's next, and how soon. */}
      <div className="mb-6">
        {nextAppointment ? (
          <Link
            href="/my/appointments"
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border">
              <div className="bg-primary py-0.5 text-center text-[10px] font-medium tracking-wide text-primary-foreground">
                {apptMonthLabel}
              </div>
              <div className="bg-background py-1.5 text-center text-2xl font-medium text-foreground">
                {apptDayLabel}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {APPOINTMENT_TYPE_LABEL[nextAppointment.type] ?? nextAppointment.type}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {nextAppointment.timeSlot}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {apptDaysAway === 0
                  ? "Today"
                  : apptDaysAway === 1
                    ? "Tomorrow"
                    : `In ${apptDaysAway} days`}
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/my/appointments/new"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CalendarPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No fitting scheduled yet</p>
              <p className="text-xs text-muted-foreground">Book a fitting whenever you&apos;re ready.</p>
            </div>
          </Link>
        )}
      </div>

      {/* Rental balance -- only shown when a real balance exists, and
          scoped to the rental it belongs to rather than shown as a
          floating account-wide stat. */}
      {rentalWithBalance && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-status-pending/30 bg-status-pending/10 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {rentalWithBalance.productName ?? "Rental"}
            </p>
            <p className="text-xs text-muted-foreground">Balance due before pickup</p>
          </div>
          <p className="font-heading text-lg font-medium text-foreground">
            {formatCurrency(rentalWithBalance.balanceDue ?? 0)}
          </p>
        </div>
      )}

      <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
        Recent orders
      </p>
      <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}