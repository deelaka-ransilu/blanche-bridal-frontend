"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardNav from "@/component/layout/DashboardNav";
import DummyCard from "@/component/layout/DummyCard";

const employeeLinks = [
  { label: "Dashboard", href: "/employee" },
  { label: "Appointments", href: "/employee/appointments" },
  { label: "Orders", href: "/employee/orders" },
  { label: "Inquiries", href: "/employee/inquiries" },
];

const cards = [
  {
    title: "Appointments",
    description: "View and manage your assigned appointments.",
    buttonLabel: "View Appointments",
    href: "/employee/appointments",
  },
  {
    title: "Orders",
    description: "Process and update customer orders.",
    buttonLabel: "View Orders",
    href: "/employee/orders",
  },
  {
    title: "Inquiries",
    description: "Respond to customer inquiries.",
    buttonLabel: "View Inquiries",
    href: "/employee/inquiries",
  },
];

export default function EmployeeDashboard() {
  useRequireAuth(["EMPLOYEE"]);

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav links={employeeLinks} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Employee Dashboard
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Your workspace at Blanche Bridal.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
