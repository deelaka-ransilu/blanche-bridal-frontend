"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Crown02Icon,
  ShieldUserIcon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { listAdmins, listEmployees, listCustomers } from "@/lib/api/auth";

interface Stats {
  admins: number;
  employees: number;
  customers: number;
}

export default function SuperadminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "there";
  const token = session?.user?.backendToken ?? "";

  useEffect(() => {
    if (!token) return;

    async function loadStats() {
      setLoading(true);
      try {
        const [adminsRes, employeesRes, customersRes] = await Promise.all([
          listAdmins(token),
          listEmployees(token),
          listCustomers(token),
        ]);
        setStats({
          admins: adminsRes.success ? (adminsRes.data?.length ?? 0) : 0,
          employees: employeesRes.success
            ? (employeesRes.data?.length ?? 0)
            : 0,
          customers: customersRes.success
            ? (customersRes.data?.length ?? 0)
            : 0,
        });
      } catch {
        setStats({ admins: 0, employees: 0, customers: 0 });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token]);

  const statCards = [
    { title: "Total Admins", value: stats?.admins, icon: Crown02Icon },
    { title: "Total Employees", value: stats?.employees, icon: ShieldUserIcon },
    { title: "Total Customers", value: stats?.customers, icon: UserGroupIcon },
    { title: "System Status", value: "Online", icon: CheckmarkCircle01Icon },
  ];

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
              System overview and management.
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
                  {loading && card.title !== "System Status" ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-semibold">{card.value ?? 0}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
