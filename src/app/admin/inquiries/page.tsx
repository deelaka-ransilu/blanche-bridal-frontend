"use client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardNav from "@/component/layout/DashboardNav";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Rentals", href: "/admin/rentals" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Employees", href: "/admin/employees" },
  { label: "Reports", href: "/admin/reports" },
];

export default function InquiriesPage() {
  useRequireAuth(["ADMIN"]);
  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav links={adminLinks} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">Inquiries</h1>
        <p className="text-gray-400 text-sm">
          Customer Inquiries — coming soon.
        </p>
      </div>
    </div>
  );
}
