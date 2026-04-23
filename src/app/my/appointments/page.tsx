"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getMyAppointments, cancelAppointment } from "@/lib/api/appointments";
import {
  AppointmentResponse,
  AppointmentStatus,
  AppointmentType,
} from "@/types";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";

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

export default function MyAppointmentsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    getMyAppointments(token).then((res) => {
      if (res.success && res.data) setAppointments(res.data);
      setLoading(false);
    });
  }, [token, status]);

  async function handleCancel(id: string) {
    if (!token) return;
    setCancellingId(id);
    try {
      const res = await cancelAppointment(id, token);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "CANCELLED" as AppointmentStatus }
              : a,
          ),
        );
        toast.success("Appointment cancelled.");
      }
    } catch {
      toast.error("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Page ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        My Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No appointments yet</p>
          <p className="text-sm text-muted-foreground">
            Book a fitting, rental pickup, or purchase consultation.
          </p>
          <Link
            href="/booking"
            className="inline-block mt-2 text-sm text-amber-700 hover:underline"
          >
            Book Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const canCancel =
              appt.status === "PENDING" || appt.status === "CONFIRMED";

            return (
              <div
                key={appt.id}
                className="flex items-center justify-between bg-white border rounded-xl px-5 py-4 transition-all"
              >
                {/* Left — info */}
                <div className="space-y-1.5">
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
                    {new Date(appt.appointmentDate).toLocaleDateString(
                      "en-LK",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}{" "}
                    at <span className="text-amber-700">{appt.timeSlot}</span>
                  </p>
                  {appt.productName && (
                    <p className="text-xs text-muted-foreground">
                      {appt.productName}
                    </p>
                  )}
                </div>

                {/* Right — cancel */}
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shrink-0"
                        disabled={cancellingId === appt.id}
                      >
                        {cancellingId === appt.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your{" "}
                          <span className="font-medium">
                            {TYPE_LABEL[appt.type]}
                          </span>{" "}
                          appointment on{" "}
                          <span className="font-medium">
                            {new Date(appt.appointmentDate).toLocaleDateString(
                              "en-LK",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}{" "}
                            at {appt.timeSlot}
                          </span>
                          . This action cannot be undone.
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
