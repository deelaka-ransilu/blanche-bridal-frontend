import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";

// ---- dummy data — replace with lib/api/customer/* calls once that exists ----
const stats = {
  orders: 2,
  nextFitting: "Jul 9",
  due: "Rs 15k",
};

const recentOrders = [
  {
    id: "1042",
    title: "Order #1042",
    subtitle: "Ivory lace gown, custom fit",
    status: "progress" as const,
    statusLabel: "In progress",
  },
  {
    id: "1038",
    title: "Order #1038",
    subtitle: "Bridesmaid rental, x3",
    status: "completed" as const,
    statusLabel: "Confirmed",
  },
];

const upcomingAppointment = {
  title: "Final fitting",
  subtitle: "Wed, Jul 9 · 2:00 pm",
  status: "pending" as const,
  statusLabel: "Pending",
};
// -----------------------------------------------------------------------

export default function MyDashboard() {
  return (
    <>
      <div className="mb-6 grid grid-cols-3 gap-2.5">
        <StatCard label="Orders" value={String(stats.orders)} />
        <StatCard label="Next fitting" value={stats.nextFitting} />
        <StatCard label="Due" value={stats.due} />
      </div>

      <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
        Recent orders
      </p>
      <div className="mb-6 flex flex-col gap-2.5">
        {recentOrders.map((order) => (
          <OrderRow
            key={order.id}
            title={order.title}
            subtitle={order.subtitle}
            status={order.status}
            statusLabel={order.statusLabel}
          />
        ))}
      </div>

      <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
        Upcoming appointment
      </p>
      <OrderRow
        title={upcomingAppointment.title}
        subtitle={upcomingAppointment.subtitle}
        status={upcomingAppointment.status}
        statusLabel={upcomingAppointment.statusLabel}
      />
    </>
  );
}