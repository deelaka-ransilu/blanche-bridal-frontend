"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Clock,
  User,
  Tag,
  FileText,
  CalendarCheck,
} from "lucide-react";
import {
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
  getAvailableSlots,
} from "@/lib/api/appointments";
import {
  AppointmentResponse,
  AppointmentStatus,
  AppointmentType,
  RescheduleAppointmentPayload,
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
import { cn } from "@/lib/utils";

// ── Badge config ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  PENDING:   "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-teal-100 text-teal-700",
};

const TYPE_BADGE: Record<AppointmentType, string> = {
  FITTING:       "bg-purple-100 text-purple-700",
  RENTAL_PICKUP: "bg-blue-100 text-blue-700",
  PURCHASE:      "bg-amber-100 text-amber-700",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  FITTING:       "Fitting",
  RENTAL_PICKUP: "Rental Pickup",
  PURCHASE:      "Purchase",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0][0];
}

function daysFromNow(dateStr: string) {
  const apptDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  apptDate.setHours(0, 0, 0, 0);
  const diff = Math.round((apptDate.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [appt, setAppt] = useState<AppointmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  // Reschedule state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDateStr, setNewDateStr] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newSlot, setNewSlot] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getAppointmentById(id, token).then((res) => {
      if (res.success && res.data) setAppt(res.data);
      setLoading(false);
    });
  }, [token, id]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!newDateStr) return;
    setSlotsLoading(true);
    setNewSlot(null);
    getAvailableSlots(newDateStr)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [newDateStr]);

  // Min date for the input = tomorrow
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  async function handleConfirm() {
    if (!token || !appt) return;
    setActioning(true);
    try {
      const res = await confirmAppointment(appt.id, token);
      if (res.success && res.data) {
        setAppt(res.data);
        toast.success("Appointment confirmed and calendar event created.");
      }
    } catch {
      toast.error("Failed to confirm appointment.");
    } finally {
      setActioning(false);
    }
  }

  async function handleComplete() {
    if (!token || !appt) return;
    setActioning(true);
    try {
      const res = await completeAppointment(appt.id, token);
      if (res.success && res.data) {
        setAppt(res.data);
        toast.success("Appointment marked as completed.");
      }
    } catch {
      toast.error("Failed to complete appointment.");
    } finally {
      setActioning(false);
    }
  }

  async function handleCancel() {
    if (!token || !appt) return;
    setActioning(true);
    try {
      const res = await cancelAppointment(appt.id, token);
      if (res.success && res.data) {
        setAppt(res.data);
        toast.success("Appointment cancelled.");
      }
    } catch {
      toast.error("Failed to cancel appointment.");
    } finally {
      setActioning(false);
    }
  }

  async function handleReschedule() {
    if (!token || !appt || !newDateStr || !newSlot) return;
    setRescheduling(true);
    try {
      const payload: RescheduleAppointmentPayload = {
        appointmentDate: newDateStr,
        timeSlot: newSlot,
      };
      const res = await rescheduleAppointment(appt.id, payload, token);
      if (res.success && res.data) {
        setAppt(res.data);
        setRescheduleOpen(false);
        setNewDateStr("");
        setNewSlot(null);
        toast.success("Appointment rescheduled. Customer has been notified by email.");
      }
    } catch {
      toast.error("Failed to reschedule appointment.");
    } finally {
      setRescheduling(false);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-2xl mx-auto">
        <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Appointment not found.
      </div>
    );
  }

  const canAct = appt.status === "PENDING" || appt.status === "CONFIRMED";

  const formattedDate = new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookedOn = new Date(appt.createdAt).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </button>

      {/* Page header */}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900">Appointment Detail</h1>
        <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", STATUS_BADGE[appt.status])}>
          {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
        </span>
        <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", TYPE_BADGE[appt.type])}>
          {TYPE_LABEL[appt.type]}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white border rounded-xl overflow-hidden">

        {/* Date & time — hero row */}
        <div className="px-5 py-4 bg-gray-50 border-b flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {formattedDate}{" "}
              <span className="text-amber-700">at {appt.timeSlot}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Booked {bookedOn} · {daysFromNow(appt.appointmentDate)}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-xs font-semibold text-blue-700 uppercase">
            {getInitials(appt.customerName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{appt.customerName ?? "—"}</p>
            {appt.customerEmail && (
              <p className="text-xs text-muted-foreground">{appt.customerEmail}</p>
            )}
          </div>
        </div>

        {/* Product + Google Calendar — two columns */}
        <div className="grid grid-cols-2 divide-x border-b">
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Tag className="w-3 h-3" />
              Product
            </div>
            <p className="text-sm font-medium text-gray-900">
              {appt.productName ?? (
                <span className="text-muted-foreground font-normal">None specified</span>
              )}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CalendarCheck className="w-3 h-3" />
              Google Calendar
            </div>
            {appt.googleEventId ? (
              <a
                href={`https://calendar.google.com/calendar/r/eventedit/${appt.googleEventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline"
              >
                View event
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Not synced</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {appt.notes && (
          <div className="px-5 py-4 border-b">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <FileText className="w-3 h-3" />
              Customer note
            </div>
            <p className="text-sm text-gray-700 italic bg-gray-50 rounded-lg px-3 py-2.5 border">
              "{appt.notes}"
            </p>
          </div>
        )}

        {/* Actions footer */}
        {canAct && (
          <div className="px-5 py-3 bg-gray-50 flex items-center gap-2 flex-wrap">
            {appt.status === "PENDING" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleConfirm}
                disabled={actioning}
              >
                Confirm Appointment
              </Button>
            )}
            {appt.status === "CONFIRMED" && (
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleComplete}
                disabled={actioning}
              >
                Mark Completed
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRescheduleOpen((v) => !v);
                setNewDateStr("");
                setNewSlot(null);
              }}
              disabled={actioning}
            >
              {rescheduleOpen ? "Close" : "Reschedule"}
            </Button>

            {/* Cancel — pushed to right */}
            <div className="ml-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={actioning}
                  >
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the appointment for{" "}
                      <span className="font-medium">{appt.customerName}</span>.
                      {appt.googleEventId
                        ? " The Google Calendar event will also be deleted."
                        : ""}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep It</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleCancel}
                    >
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule panel */}
      {rescheduleOpen && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-gray-900">Reschedule Appointment</h2>
          </div>

          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              The customer will receive an email with the updated date and time.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Date input */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">New date</label>
                <input
                  type="date"
                  min={minDate}
                  value={newDateStr}
                  onChange={(e) => setNewDateStr(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Slot picker */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Available time slots</label>
                {!newDateStr ? (
                  <p className="text-xs text-muted-foreground pt-2">Pick a date first</p>
                ) : slotsLoading ? (
                  <p className="text-xs text-muted-foreground pt-2">Loading slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground pt-2">No slots available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setNewSlot(slot)}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-xs font-medium transition-all",
                          newSlot === slot
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-amber-400",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setRescheduleOpen(false); setNewDateStr(""); setNewSlot(null); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleReschedule}
              disabled={!newDateStr || !newSlot || rescheduling}
            >
              {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}