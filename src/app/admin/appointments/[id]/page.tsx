"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
} from "@/lib/api/appointments";
import { getAvailableSlots } from "@/lib/api/appointments";
import {
  AppointmentResponse,
  AppointmentStatus,
  AppointmentType,
  RescheduleAppointmentPayload,
} from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
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

  // Fetch slots when new date picked for reschedule
  useEffect(() => {
    if (!newDate) return;
    setSlotsLoading(true);
    setNewSlot(null);
    const iso = newDate.toISOString().split("T")[0];
    getAvailableSlots(iso)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [newDate]);

  function isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today || date.getDay() === 0;
  }

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
    if (!token || !appt || !newDate || !newSlot) return;
    setRescheduling(true);
    try {
      const payload: RescheduleAppointmentPayload = {
        appointmentDate: newDate.toISOString().split("T")[0],
        timeSlot: newSlot,
      };
      const res = await rescheduleAppointment(appt.id, payload, token);
      if (res.success && res.data) {
        setAppt(res.data);
        setRescheduleOpen(false);
        setNewDate(undefined);
        setNewSlot(null);
        toast.success("Appointment rescheduled.");
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
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
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

  // ── Detail ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Appointment Detail
        </h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[appt.status]}`}
        >
          {appt.status}
        </span>
      </div>

      {/* Main info card */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[appt.type]}`}
            >
              {TYPE_LABEL[appt.type]}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
            <p className="font-medium text-gray-900">
              {new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at <span className="text-amber-700">{appt.timeSlot}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Customer</p>
            <p className="font-medium text-gray-900">
              {appt.customerName ?? "—"}
            </p>
            {appt.customerEmail && (
              <p className="text-xs text-muted-foreground">
                {appt.customerEmail}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Product</p>
            <p className="font-medium text-gray-900">
              {appt.productName ?? "None specified"}
            </p>
          </div>
          {appt.notes && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-gray-800">{appt.notes}</p>
            </div>
          )}
          {appt.googleEventId && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">
                Google Calendar Event
              </p>
              <a
                href={`https://calendar.google.com/calendar/r/eventedit/${appt.googleEventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline"
              >
                {appt.googleEventId}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Booked On</p>
            <p className="text-gray-700">
              {new Date(appt.createdAt).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {canAct && (
        <div className="flex flex-wrap gap-2">
          {appt.status === "PENDING" && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirm}
              disabled={actioning}
            >
              Confirm Appointment
            </Button>
          )}
          {appt.status === "CONFIRMED" && (
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleComplete}
              disabled={actioning}
            >
              Mark Completed
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setRescheduleOpen((v) => !v)}
            disabled={actioning}
          >
            {rescheduleOpen ? "Close Reschedule" : "Reschedule"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={actioning}
              >
                Cancel Appointment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
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
      )}

      {/* Reschedule panel */}
      {rescheduleOpen && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            Reschedule Appointment
          </h2>

          {/* Date picker */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Pick a new date
            </p>
            <div className="flex justify-start">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={(d) => {
                  setNewDate(d);
                  setNewSlot(null);
                }}
                disabled={isDateDisabled}
                className="rounded-xl border"
              />
            </div>
          </div>

          {/* Slot picker */}
          {newDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Pick a new time slot
              </p>
              {slotsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading slots...
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No slots available on this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setNewSlot(slot)}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
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
          )}

          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleReschedule}
            disabled={!newDate || !newSlot || rescheduling}
          >
            {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </div>
      )}
    </div>
  );
}
