import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderRow } from "@/components/dashboard/order-row";

// ---- dummy data — replace with lib/api/admin/* calls once that exists ----
const stats = {
  totalOrders: 84,
  activeRentals: 12,
  pendingAppointments: 6,
  revenueThisMonth: "Rs 1.2M",
};

const recentOrders = [
  {
    id: "1042",
    title: "Order #1042",
    subtitle: "Amaya Fernando · Ivory lace gown",
    status: "progress" as const,
    statusLabel: "In progress",
  },
  {
    id: "1041",
    title: "Order #1041",
    subtitle: "Nadeesha Perera · Bridesmaid rental x3",
    status: "pending" as const,
    statusLabel: "Pending approval",
  },
  {
    id: "1038",
    title: "Order #1038",
    subtitle: "Kavindi Silva · Custom veil",
    status: "completed" as const,
    statusLabel: "Confirmed",
  },
];

const recentInquiries = [
  {
    id: "q1",
    title: "General inquiry",
    subtitle: "Sanduni W. · asked about rental pricing",
    status: "pending" as const,
    statusLabel: "Unanswered",
  },
  {
    id: "q2",
    title: "Appointment request",
    subtitle: "Thilini R. · fitting availability",
    status: "completed" as const,
    statusLabel: "Replied",
  },
];
// -----------------------------------------------------------------------

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div>
      <div className="mb-6">
        <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-xl font-medium text-foreground">
          Hi, {firstName}
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Active rentals" value={String(stats.activeRentals)} />
        <StatCard label="Pending appts" value={String(stats.pendingAppointments)} />
        <StatCard label="Revenue (mo.)" value={stats.revenueThisMonth} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent orders
          </p>
          <div className="flex flex-col gap-2.5">
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
        </div>

        <div>
          <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
            Recent inquiries
          </p>
          <div className="flex flex-col gap-2.5">
            {recentInquiries.map((inquiry) => (
              <OrderRow
                key={inquiry.id}
                title={inquiry.title}
                subtitle={inquiry.subtitle}
                status={inquiry.status}
                statusLabel={inquiry.statusLabel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}