"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Employees", href: "/admin/employees" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} title="Admin Panel">
      <h2 className="text-2xl font-semibold mb-6">
        Welcome, {session?.user?.email}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Customers", value: "—" },
          { label: "Active Rentals", value: "—" },
          { label: "Pending Orders", value: "—" },
          { label: "Open Inquiries", value: "—" },
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
