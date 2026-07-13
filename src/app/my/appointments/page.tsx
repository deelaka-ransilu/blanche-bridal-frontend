import { getMyAppointments } from "@/lib/api/appointments";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { BookedToast } from "@/components/appointments/booked-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarPlus, Sparkles, PenLine, Clock } from "lucide-react";
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
      <BookedToast />

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
          {appointments.map((appt) => {
            const apptDate = new Date(appt.appointmentDate);
            const monthLabel = apptDate
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase();
            const dayLabel = apptDate.getDate();

            return (
              <div key={appt.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <div className="bg-primary py-0.5 text-center text-[10px] font-medium tracking-wide text-primary-foreground">
                        {monthLabel}
                      </div>
                      <div className="bg-background py-1 text-center text-xl font-medium text-foreground">
                        {dayLabel}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {APPOINTMENT_TYPE_LABEL[appt.type] ?? appt.type}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {appt.timeSlot}
                        {appt.productName ? ` · ${appt.productName}` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>
                    {APPOINTMENT_STATUS_LABEL[appt.status]}
                  </StatusBadge>
                </div>

                {appt.type === "CUSTOM_CONSULTATION" && (
                  <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
                    {appt.occasionType && (
                      <div className="flex items-start gap-2 text-sm">
                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <p className="text-foreground">
                          <span className="text-muted-foreground">Occasion:</span>{" "}
                          {OCCASION_TYPE_LABEL[appt.occasionType] ?? appt.occasionType}
                          {appt.occasionDate ? ` · ${appt.occasionDate}` : ""}
                        </p>
                      </div>
                    )}
                    {appt.stylePreferences && (
                      <div className="flex items-start gap-2 text-sm">
                        <PenLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <p className="text-foreground">
                          <span className="text-muted-foreground">Style notes:</span>{" "}
                          {appt.stylePreferences}
                        </p>
                      </div>
                    )}
                    {appt.referenceImages && appt.referenceImages.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                          Reference images
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {appt.referenceImages.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={url}
                              src={url}
                              alt="Reference"
                              className="h-20 w-20 rounded-lg border border-border object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <RescheduleForm appointmentId={appt.id} />
                    </div>
                    <form
                      action={cancelAppointmentAction.bind(null, appt.id)}
                      className="self-end sm:self-auto"
                    >
                      <Button type="submit" size="sm" variant="outline">
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}