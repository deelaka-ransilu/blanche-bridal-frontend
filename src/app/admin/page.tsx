"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardNav from "@/component/layout/DashboardNav";
import DummyCard from "@/component/layout/DummyCard";

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

const cards = [
  {
    title: "Appointments",
    description: "View, approve, and reject customer appointments.",
    buttonLabel: "Manage Appointments",
    href: "/admin/appointments",
  },
  {
    title: "Inventory",
    description: "Track dress stock, variants, and availability.",
    buttonLabel: "Manage Inventory",
    href: "/admin/inventory",
  },
  {
    title: "Orders",
    description: "View and process customer orders.",
    buttonLabel: "Manage Orders",
    href: "/admin/orders",
  },
  {
    title: "Rentals",
    description: "Manage rental dresses, availability and returns.",
    buttonLabel: "Manage Rentals",
    href: "/admin/rentals",
  },
  {
    title: "Customers",
    description: "View and manage customer profiles.",
    buttonLabel: "Manage Customers",
    href: "/admin/customers",
  },
  {
    title: "Employees",
    description: "Manage employee accounts and roles.",
    buttonLabel: "Manage Employees",
    href: "/admin/employees",
  },
  {
    title: "Inquiries",
    description: "View and respond to customer inquiries.",
    buttonLabel: "View Inquiries",
    href: "/admin/inquiries",
  },
  {
    title: "Reports",
    description: "Sales, revenue and performance reports.",
    buttonLabel: "View Reports",
    href: "/admin/reports",
  },
];

export default function AdminDashboard() {
  useRequireAuth(["ADMIN"]);

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav links={adminLinks} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Manage all aspects of Blanche Bridal.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <DummyCard
              key={card.href}
              title={card.title}
              description={card.description}
              buttonLabel={card.buttonLabel}
              onClick={() => (window.location.href = card.href)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
