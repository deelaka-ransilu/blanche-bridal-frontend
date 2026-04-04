"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/employee/dashboard" },
  { label: "Appointments", href: "/employee/appointments" },
  { label: "Profile", href: "/employee/profile" },
];

export default function EmployeeDashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} title="Employee Panel">
      <h2 className="text-2xl font-semibold mb-6">
        Welcome, {session?.user?.email}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Today's Appointments", value: "—" },
          { label: "Active Rentals", value: "—" },
          { label: "Pending Orders", value: "—" },
          { label: "Inquiries", value: "—" },
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
