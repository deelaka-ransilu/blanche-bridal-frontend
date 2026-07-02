import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, CheckCircle2, Calendar, Menu } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
      <p className="text-xl font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
  children,
}: {
  status: "pending" | "progress" | "completed" | "cancelled";
  children: React.ReactNode;
}) {
  const map = {
    pending: "bg-status-pending/15 text-status-pending",
    progress: "bg-status-progress/15 text-status-progress",
    completed: "bg-status-completed/15 text-status-completed",
    cancelled: "bg-status-cancelled/15 text-status-cancelled",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map[status]}`}>
      {children}
    </span>
  );
}

function OrderRow({
  title,
  subtitle,
  status,
  statusLabel,
}: {
  title: string;
  subtitle: string;
  status: "pending" | "progress" | "completed" | "cancelled";
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

export default async function MyDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-28 pt-5">
      <div className="mx-auto max-w-md px-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
            <h1 className="font-heading text-xl font-medium text-foreground">
              Hi, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {initial}
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-3 gap-2.5">
          <StatCard label="Orders" value={String(stats.orders)} />
          <StatCard label="Next fitting" value={stats.nextFitting} />
          <StatCard label="Due" value={stats.due} />
        </div>

        {/* Recent orders */}
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

        {/* Upcoming appointment */}
        <p className="font-heading mb-2.5 text-[15px] font-medium text-foreground">
          Upcoming appointment
        </p>
        <OrderRow
          title={upcomingAppointment.title}
          subtitle={upcomingAppointment.subtitle}
          status={upcomingAppointment.status}
          statusLabel={upcomingAppointment.statusLabel}
        />
      </div>

      <BottomNav/>
    </div>
  );
}