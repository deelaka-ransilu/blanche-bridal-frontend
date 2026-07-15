import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { AdminTopnav, type NotificationItem } from "@/components/admin/admin-topnav";
import { getAllOrders } from "@/lib/api/orders";
import { getInquiries } from "@/lib/api/inquiries";

const NOTIFICATION_LIMIT = 6;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [ordersResult, inquiriesResult] = await Promise.all([
    getAllOrders(),
    getInquiries(),
  ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  const inquiries = inquiriesResult.success ? inquiriesResult.data : [];

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const openInquiries = inquiries.filter((i) => i.status === "OPEN");

  const notifications: NotificationItem[] = [
    ...pendingOrders.map((o) => ({
      id: `order-${o.id}`,
      title: "Order awaiting confirmation",
      subtitle: `#${o.id.slice(0, 8)} · ${o.customerFirstName ?? ""} ${o.customerLastName ?? ""}`.trim(),
      href: `/admin/orders/${o.id}`,
    })),
    ...openInquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      title: "Unanswered inquiry",
      subtitle: i.subject || i.name,
      href: `/admin/inquiries/${i.id}`,
    })),
  ].slice(0, NOTIFICATION_LIMIT);

  return (
    <div className="min-h-svh bg-background">
      <AdminTopnav userName={firstName} notifications={notifications} />
      <main className="p-4 sm:p-6 lg:p-8 pt-0">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}