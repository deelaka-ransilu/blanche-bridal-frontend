"use client";

import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Store01Icon,
  Package01Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";

const statCards = [
  {
    title: "Total Customers",
    value: "—",
    icon: UserGroupIcon,
  },
  {
    title: "Active Rentals",
    value: "—",
    icon: Store01Icon,
  },
  {
    title: "Pending Orders",
    value: "—",
    icon: Package01Icon,
  },
  {
    title: "Open Inquiries",
    value: "—",
    icon: MessageQuestionIcon,
  },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "there";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here's a quick overview of the boutique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="pb-2">
                  <HugeiconsIcon
                    icon={card.icon}
                    strokeWidth={1.5}
                    className="size-6 text-amber-600"
                  />
                  <CardTitle className="text-sm mt-2">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
