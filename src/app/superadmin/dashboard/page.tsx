"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/superadmin/dashboard" },
  { label: "Manage Admins", href: "/superadmin/admins" },
  { label: "Profile", href: "/superadmin/profile" },
];

export default function SuperadminDashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} title="Superadmin Panel">
      <h2 className="text-2xl font-semibold mb-6">
        Welcome, {session?.user?.email}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Admins", value: "—" },
          { label: "Total Employees", value: "—" },
          { label: "Total Customers", value: "—" },
          { label: "System Status", value: "Online" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
