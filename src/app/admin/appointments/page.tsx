"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "@/lib/api/appointments";
import { AppointmentResponse, AppointmentStatus, AppointmentType } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
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

type TabStatus = AppointmentStatus | "ALL";

const ALL_STATUSES: TabStatus[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const TYPE_BADGE: Record<AppointmentType, string> = {
  FITTING:       "bg-purple-100 text-purple-700",
  RENTAL_PICKUP: "bg-blue-100 text-blue-700",
  PURCHASE:      "bg-amber-100 text-amber-700",
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  PENDING:   "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-teal-100 text-teal-700",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  FITTING:       "Fitting",
  RENTAL_PICKUP: "Rental Pickup",
  PURCHASE:      "Purchase",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

/** Short 3-letter abbreviation shown inside the type icon box */
const TYPE_ABBR: Record<AppointmentType, string> = {
  FITTING:       "FIT",
  RENTAL_PICKUP: "PKP",
  PURCHASE:      "BUY",
};

const TYPE_ICON_COLOR: Record<AppointmentType, string> = {
  FITTING:       "text-purple-600",
  RENTAL_PICKUP: "text-blue-600",
  PURCHASE:      "text-amber-600",
};

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;
  const router = useRouter();

  const [tab, setTab] = useState<TabStatus>("ALL");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // ── Counts per status (computed from full list) ──────────────────────────────
  const pendingCount    = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount  = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount  = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledCount  = appointments.filter((a) => a.status === "CANCELLED").length;

  const tabCount: Partial<Record<TabStatus, number>> = {
    ALL:       appointments.length,
    PENDING:   pendingCount,
    CONFIRMED: confirmedCount,
    COMPLETED: completedCount,
    CANCELLED: cancelledCount,
  };

  const tabBadgeStyle: Partial<Record<TabStatus, string>> = {
    PENDING:  "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  // ── Displayed list ───────────────────────────────────────────────────────────
  const currentList =
    tab === "ALL" ? appointments : appointments.filter((a) => a.status === tab);

  // ── Data loading ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!token) { setLoading(false); return; }
    setLoading(true);
    // Always fetch ALL and filter client-side so tab-counts stay correct
    getAllAppointments(token).then((res) => {
      if (res.success && res.data) setAppointments(res.data);
      setLoading(false);
    });
  }, [token, status]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  function patchAppointment(updated: AppointmentResponse) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleConfirm(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await confirmAppointment(id, token);
      if (res.success && res.data) { patchAppointment(res.data); toast.success("Appointment confirmed."); }
    } catch { toast.error("Failed to confirm appointment."); }
    finally { setActioningId(null); }
  }

  async function handleComplete(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await completeAppointment(id, token);
      if (res.success && res.data) { patchAppointment(res.data); toast.success("Marked as completed."); }
    } catch { toast.error("Failed to complete appointment."); }
    finally { setActioningId(null); }
  }

  async function handleCancel(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await cancelAppointment(id, token);
      if (res.success && res.data) { patchAppointment(res.data); toast.success("Appointment cancelled."); }
    } catch { toast.error("Failed to cancel appointment."); }
    finally { setActioningId(null); }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">
            {appointments.length} total
            {pendingCount > 0 && `, ${pendingCount} pending action`}
          </p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
          {ALL_STATUSES.map((t) => {
            const count = tabCount[t] ?? 0;
            const badgeCls = tabBadgeStyle[t] ?? "bg-gray-100 text-gray-600";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
                  tab === t
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {tab === "ALL" ? "No appointments found." : `No ${tab.toLowerCase()} appointments.`}
          </div>
        ) : (
          <div className="divide-y">
            {currentList.map((appt) => {
              const isMuted = appt.status === "CANCELLED" || appt.status === "COMPLETED";
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  {/* Type icon box — mirrors the dress thumbnail box */}
                  <div
                    className={`relative w-9 h-11 sm:w-10 sm:h-12 bg-gray-100 rounded-md overflow-hidden shrink-0 flex flex-col items-center justify-center gap-0.5 ${isMuted ? "opacity-40" : ""}`}
                  >
                    <HugeiconsIcon
                      icon={Calendar01Icon}
                      className={`size-4 ${TYPE_ICON_COLOR[appt.type]}`}
                    />
                    <span className={`text-[9px] font-bold tracking-wide ${TYPE_ICON_COLOR[appt.type]}`}>
                      {TYPE_ABBR[appt.type]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[appt.type]}`}>
                        {TYPE_LABEL[appt.type]}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[appt.status]}`}>
                        {STATUS_LABEL[appt.status]}
                      </span>
                    </div>
                    {/* Date + time */}
                    <p className={`text-sm font-medium truncate ${isMuted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
                        weekday: "short",
                        year:    "numeric",
                        month:   "short",
                        day:     "numeric",
                      })}{" "}
                      {!isMuted && (
                        <span className="text-amber-700">at {appt.timeSlot}</span>
                      )}
                    </p>
                    {/* Customer + product */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {appt.customerName ?? "—"}
                      {appt.productName && <span className="ml-1.5">· {appt.productName}</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {appt.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2.5"
                        onClick={() => handleConfirm(appt.id)}
                        disabled={actioningId === appt.id}
                      >
                        {actioningId === appt.id ? "…" : "Confirm"}
                      </Button>
                    )}
                    {appt.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white h-7 text-xs px-2.5"
                        onClick={() => handleComplete(appt.id)}
                        disabled={actioningId === appt.id}
                      >
                        {actioningId === appt.id ? "…" : "Complete"}
                      </Button>
                    )}

                    {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs px-2.5"
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
                              <span className="font-medium">{TYPE_LABEL[appt.type]}</span>{" "}
                              for{" "}
                              <span className="font-medium">{appt.customerName}</span>{" "}
                              on{" "}
                              <span className="font-medium">
                                {new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
                                  month: "short",
                                  day:   "numeric",
                                })}{" "}
                                at {appt.timeSlot}
                              </span>?
                              {appt.googleEventId
                                ? " The linked Google Calendar event will also be removed."
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

                    {/* Detail chevron — always present */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/appointments/${appt.id}`)}
                    >
                      <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}