"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Store01Icon,
  Package01Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";
import { listCustomers } from "@/lib/api/auth";
import { apiRequest } from "@/lib/api/client";
import { PaginatedResponse } from "@/types";

interface Stats {
  customers: number;
  activeRentals: number;
  pendingOrders: number;
  openInquiries: number;
}

export default function AdminDashboardPage() {
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
        const [customersRes, rentalsRes, ordersRes, inquiriesRes] =
          await Promise.allSettled([
            listCustomers(token),
            apiRequest<PaginatedResponse<unknown>>(
              "/api/rentals?status=ACTIVE&size=1",
              {},
              token
            ),
            apiRequest<PaginatedResponse<unknown>>(
              "/api/orders?status=PENDING&size=1",
              {},
              token
            ),
            apiRequest<PaginatedResponse<unknown>>(
              "/api/inquiries?status=OPEN&size=1",
              {},
              token
            ),
          ]);

        const customers =
          customersRes.status === "fulfilled" && customersRes.value.success
            ? (customersRes.value.data as unknown[])?.length ?? 0
            : 0;

        const activeRentals =
          rentalsRes.status === "fulfilled" && rentalsRes.value.success
            ? rentalsRes.value.pagination?.total ?? 0
            : 0;

        const pendingOrders =
          ordersRes.status === "fulfilled" && ordersRes.value.success
            ? ordersRes.value.pagination?.total ?? 0
            : 0;

        const openInquiries =
          inquiriesRes.status === "fulfilled" && inquiriesRes.value.success
            ? inquiriesRes.value.pagination?.total ?? 0
            : 0;

        setStats({ customers, activeRentals, pendingOrders, openInquiries });
      } catch {
        setStats({
          customers: 0,
          activeRentals: 0,
          pendingOrders: 0,
          openInquiries: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token]);

  const statCards = [
    { title: "Total Customers", value: stats?.customers, icon: UserGroupIcon },
    { title: "Active Rentals", value: stats?.activeRentals, icon: Store01Icon },
    { title: "Pending Orders", value: stats?.pendingOrders, icon: Package01Icon },
    { title: "Open Inquiries", value: stats?.openInquiries, icon: MessageQuestionIcon },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">
          Welcome back, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's a quick overview of the boutique.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2 pt-4 px-4">
              <HugeiconsIcon
                icon={card.icon}
                strokeWidth={1.5}
                className="size-5 sm:size-6 text-amber-600"
              />
              <CardTitle className="text-xs sm:text-sm mt-2 leading-snug">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-xl sm:text-2xl font-semibold">
                  {card.value ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}