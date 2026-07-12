import { getMyAppointments } from "@/lib/api/appointments";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { AppointmentStatus } from "@/types/appointment";

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  FITTING: "Fitting",
  RENTAL_PICKUP: "Rental pickup",
  PURCHASE: "Purchase",
  CUSTOM_CONSULTATION: "Custom design consultation",
};

const OCCASION_TYPE_LABEL: Record<string, string> = {
  WEDDING: "Wedding",
  ENGAGEMENT: "Engagement",
  OTHER: "Other",
};

export default async function MyAppointmentsPage() {
  const result = await getMyAppointments();
  const appointments = result.success ? result.data : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">Appointments</h1>
        {appointments.length > 0 && (
          <Link href="/my/appointments/new">
            <Button size="sm">Book New</Button>
          </Link>
        )}
      </div>

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CalendarPlus className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">No appointments yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Book a fitting, pickup, or purchase visit whenever you&apos;re ready.
          </p>
          <Link href="/my/appointments/new">
            <Button size="sm" className="mt-1">
              Book an appointment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">
                  {APPOINTMENT_TYPE_LABEL[appt.type] ?? appt.type}
                </p>
                <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>
                  {APPOINTMENT_STATUS_LABEL[appt.status]}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {appt.appointmentDate} at {appt.timeSlot}
                {appt.productName ? ` · ${appt.productName}` : ""}
              </p>

              {appt.type === "CUSTOM_CONSULTATION" && (
                <div className="mt-3 space-y-1.5 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                  {appt.occasionType && (
                    <p className="text-foreground">
                      <span className="text-muted-foreground">Occasion:</span>{" "}
                      {OCCASION_TYPE_LABEL[appt.occasionType] ?? appt.occasionType}
                      {appt.occasionDate ? ` · ${appt.occasionDate}` : ""}
                    </p>
                  )}
                  {appt.stylePreferences && (
                    <p className="text-foreground">
                      <span className="text-muted-foreground">Style notes:</span>{" "}
                      {appt.stylePreferences}
                    </p>
                  )}
                  {appt.referenceImages && appt.referenceImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {appt.referenceImages.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt="Reference"
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                <div className="mt-3 flex items-center gap-3">
                  <form action={cancelAppointmentAction.bind(null, appt.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      Cancel
                    </Button>
                  </form>
                  <RescheduleForm appointmentId={appt.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}