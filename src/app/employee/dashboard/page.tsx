"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Store01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import {
  getAllAppointments,
  completeAppointment,
} from "@/lib/api/appointments";
import { getAllRentals } from "@/lib/api/rentals";
import { AppointmentResponse, RentalResponse } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

const TYPE_LABELS: Record<string, string> = {
  FITTING: "Fitting",
  RENTAL_PICKUP: "Rental Pickup",
  PURCHASE: "Purchase",
};

const TYPE_COLORS: Record<string, string> = {
  FITTING: "bg-purple-100 text-purple-700",
  RENTAL_PICKUP: "bg-blue-100 text-blue-700",
  PURCHASE: "bg-amber-100 text-amber-700",
};

// ─── component ───────────────────────────────────────────────────────────────

export default function EmployeeDashboardPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";
  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "there";

  const [todayAppts, setTodayAppts] = useState<AppointmentResponse[]>([]);
  const [activeRentals, setActiveRentals] = useState<RentalResponse[]>([]);
  const [overdueRentals, setOverdueRentals] = useState<RentalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ── fetch all data on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const today = todayISO();

    async function fetchDashboard() {
      try {
        // Fetch PENDING + CONFIRMED appointments (large page so we don't miss any)
        const [pendingRes, confirmedRes, activeRes, overdueRes] =
          await Promise.all([
            getAllAppointments(token, "PENDING", 0),
            getAllAppointments(token, "CONFIRMED", 0),
            getAllRentals(token, "ACTIVE", 0),
            getAllRentals(token, "OVERDUE", 0),
          ]);

        // Merge pending + confirmed and filter to today's date
        const allUpcoming = [
          ...(Array.isArray(pendingRes.data) ? pendingRes.data : []),
          ...(Array.isArray(confirmedRes.data) ? confirmedRes.data : []),
        ];
        const todays = allUpcoming
          .filter((a) => a.appointmentDate === today)
          .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

        setTodayAppts(todays);
        setActiveRentals(
          Array.isArray(activeRes.data) ? activeRes.data.slice(0, 5) : [],
        );
        setOverdueRentals(
          Array.isArray(overdueRes.data) ? overdueRes.data : [],
        );
      } catch (err) {
        console.error("Employee dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  // ── complete an appointment inline ───────────────────────────────────────
  async function handleComplete(appointmentId: string) {
    try {
      await completeAppointment(appointmentId, token);
      setTodayAppts((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "COMPLETED" } : a,
        ),
      );
    } catch (err) {
      console.error("Failed to complete appointment:", err);
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────
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
          {/* ── Greeting ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's on your plate today.
            </p>
          </div>

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={1.5}
                  className="size-6 text-amber-600"
                />
                <CardTitle className="text-sm mt-2">
                  Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {loading ? "—" : todayAppts.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <HugeiconsIcon
                  icon={Store01Icon}
                  strokeWidth={1.5}
                  className="size-6 text-amber-600"
                />
                <CardTitle className="text-sm mt-2">Active Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {loading ? "—" : activeRentals.length}
                </p>
              </CardContent>
            </Card>

            <Card className={overdueRentals.length > 0 ? "border-red-300" : ""}>
              <CardHeader className="pb-2">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  strokeWidth={1.5}
                  className={`size-6 ${
                    overdueRentals.length > 0
                      ? "text-red-500"
                      : "text-amber-600"
                  }`}
                />
                <CardTitle className="text-sm mt-2">Overdue Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-semibold ${
                    overdueRentals.length > 0 ? "text-red-600" : ""
                  }`}
                >
                  {loading ? "—" : overdueRentals.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Today's appointments list ─────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-muted animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : todayAppts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No appointments scheduled for today.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {todayAppts.map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                      >
                        {/* time + customer */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm font-mono font-medium w-12 shrink-0">
                            {appt.timeSlot}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {appt.customerName ?? "Customer"}
                            </p>
                            {appt.productName && (
                              <p className="text-xs text-muted-foreground truncate">
                                {appt.productName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* right side: type badge + action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              TYPE_COLORS[appt.type] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {TYPE_LABELS[appt.type] ?? appt.type}
                          </span>

                          {appt.status !== "COMPLETED" &&
                            appt.status !== "CANCELLED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleComplete(appt.id)}
                              >
                                <HugeiconsIcon
                                  icon={CheckmarkCircle01Icon}
                                  strokeWidth={2}
                                  className="size-3.5 mr-1"
                                />
                                Done
                              </Button>
                            )}

                          {appt.status === "COMPLETED" && (
                            <Badge
                              variant="outline"
                              className="text-teal-600 border-teal-300 text-xs"
                            >
                              Done
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Active rentals list ───────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Active Rentals — Upcoming Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 bg-muted animate-pulse rounded"
                        />
                      ))}
                    </div>
                  ) : activeRentals.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No active rentals.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeRentals.map((rental) => (
                        <div
                          key={rental.id}
                          className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {rental.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rental.customerName ?? "Customer"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Due</p>
                            <p className="text-sm font-medium">
                              {rental.rentalEnd}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Overdue rentals (only shown when there are some) ─────── */}
              {!loading && overdueRentals.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-red-700 flex items-center gap-2">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        strokeWidth={2}
                        className="size-4"
                      />
                      Overdue Rentals — Needs Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {overdueRentals.map((rental) => (
                        <div
                          key={rental.id}
                          className="flex items-center justify-between gap-3 py-2 border-b border-red-100 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-red-800">
                              {rental.productName}
                            </p>
                            <p className="text-xs text-red-600">
                              {rental.customerName ?? "Customer"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-red-500">Was due</p>
                            <p className="text-sm font-medium text-red-700">
                              {rental.rentalEnd}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
