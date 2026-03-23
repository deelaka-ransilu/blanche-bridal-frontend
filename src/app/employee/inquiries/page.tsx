"use client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardNav from "@/component/layout/DashboardNav";

const employeeLinks = [
  { label: "Dashboard", href: "/employee" },
  { label: "Appointments", href: "/employee/appointments" },
  { label: "Orders", href: "/employee/orders" },
  { label: "Inquiries", href: "/employee/inquiries" },
];

export default function EmployeeInquiriesPage() {
  useRequireAuth(["EMPLOYEE"]);
  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav links={employeeLinks} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">Inquiries</h1>
        <p className="text-gray-400 text-sm">Your inquiries — coming soon.</p>
      </div>
    </div>
  );
}
