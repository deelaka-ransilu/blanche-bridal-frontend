import { getAllAppointments } from "@/lib/api/appointments";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  completeAppointmentAction,
} from "@/lib/actions/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/types/appointment";

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const OCCASION_TYPE_LABEL: Record<string, string> = {
  WEDDING: "Wedding",
  ENGAGEMENT: "Engagement",
  OTHER: "Other",
};

export default async function AdminAppointmentsPage() {
  const result = await getAllAppointments();
  const appointments = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Appointments</h1>

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

      <div className="space-y-2">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">
                {appt.customerName} · {appt.type}
              </p>
              <p className="text-sm text-muted-foreground">
                {appt.appointmentDate} at {appt.timeSlot}
                {appt.productName ? ` · ${appt.productName}` : ""}
              </p>
              {appt.notes && (
                <p className="mt-1 text-sm text-muted-foreground">Notes: {appt.notes}</p>
              )}

              {appt.type === "CUSTOM_CONSULTATION" && (
                <div className="mt-2 space-y-1.5 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
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

              {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                <div className="mt-2">
                  <RescheduleForm appointmentId={appt.id} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>
                {appt.status}
              </StatusBadge>

              {appt.status === "PENDING" && (
                <form action={confirmAppointmentAction.bind(null, appt.id)}>
                  <Button type="submit" size="sm">
                    Confirm
                  </Button>
                </form>
              )}

              {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                <form action={completeAppointmentAction.bind(null, appt.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Complete
                  </Button>
                </form>
              )}

              {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                <form action={cancelAppointmentAction.bind(null, appt.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Cancel
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">No appointments yet.</p>
        )}
      </div>
    </div>
  );
}