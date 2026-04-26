"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CalendarCheck, ChevronRight } from "lucide-react";
import {
  getAllAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "@/lib/api/appointments";
import {
  AppointmentResponse,
  AppointmentStatus,
  AppointmentType,
} from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Badge config ──────────────────────────────────────────────────────────────

const ALL_STATUSES: (AppointmentStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-teal-100 text-teal-700",
};

const TYPE_BADGE: Record<AppointmentType, string> = {
  FITTING: "bg-purple-100 text-purple-700",
  RENTAL_PICKUP: "bg-blue-100 text-blue-700",
  PURCHASE: "bg-amber-100 text-amber-700",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  FITTING: "Fitting",
  RENTAL_PICKUP: "Rental Pickup",
  PURCHASE: "Purchase",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllAppointments(token, activeTab === "ALL" ? undefined : activeTab).then(
      (res) => {
        if (res.success && res.data) setAppointments(res.data);
        setLoading(false);
      },
    );
  }, [token, activeTab, status]);

  async function handleConfirm(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await confirmAppointment(id, token);
      if (res.success && res.data) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? res.data! : a)),
        );
        toast.success("Appointment confirmed and calendar event created.");
      }
    } catch {
      toast.error("Failed to confirm appointment.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleComplete(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await completeAppointment(id, token);
      if (res.success && res.data) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? res.data! : a)),
        );
        toast.success("Appointment marked as completed.");
      }
    } catch {
      toast.error("Failed to complete appointment.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await cancelAppointment(id, token);
      if (res.success && res.data) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? res.data! : a)),
        );
        toast.success("Appointment cancelled.");
      }
    } catch {
      toast.error("Failed to cancel appointment.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Appointments</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === s
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No appointments</p>
          <p className="text-sm text-muted-foreground">
            No {activeTab === "ALL" ? "" : activeTab.toLowerCase() + " "}
            appointments found.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[appt.type]}`}
                  >
                    {TYPE_LABEL[appt.type]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[appt.status]}`}
                  >
                    {appt.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at <span className="text-amber-700">{appt.timeSlot}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {appt.customerName ?? "—"}
                  {appt.productName ? ` · ${appt.productName}` : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Confirm (PENDING only) */}
                {appt.status === "PENDING" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleConfirm(appt.id)}
                    disabled={actioningId === appt.id}
                  >
                    Confirm
                  </Button>
                )}

                {/* Complete (CONFIRMED only) */}
                {appt.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => handleComplete(appt.id)}
                    disabled={actioningId === appt.id}
                  >
                    Complete
                  </Button>
                )}

                {/* Cancel (PENDING or CONFIRMED) */}
                {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={actioningId === appt.id}
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cancel the{" "}
                          <span className="font-medium">
                            {TYPE_LABEL[appt.type]}
                          </span>{" "}
                          for{" "}
                          <span className="font-medium">
                            {appt.customerName}
                          </span>{" "}
                          on{" "}
                          <span className="font-medium">
                            {new Date(appt.appointmentDate).toLocaleDateString(
                              "en-LK",
                              { month: "short", day: "numeric" },
                            )}{" "}
                            at {appt.timeSlot}
                          </span>
                          ?
                          {appt.googleEventId
                            ? " The Google Calendar event will also be deleted."
                            : ""}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep It</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleCancel(appt.id)}
                        >
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* View detail */}
                <Link href={`/admin/appointments/${appt.id}`}>
                  <Button size="sm" variant="ghost" className="px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
