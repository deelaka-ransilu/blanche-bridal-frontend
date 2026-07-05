import { getMyAppointments } from "@/lib/api/appointments";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { RescheduleForm } from "@/components/appointments/reschedule-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { AppointmentStatus } from "@/types/appointment";

const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, Status> = {
  PENDING: "pending",
  CONFIRMED: "progress",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export default async function MyAppointmentsPage() {
  const result = await getMyAppointments();
  const appointments = result.success ? result.data : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">Appointments</h1>
        <Link href="/my/appointments/new">
          <Button size="sm">Book New</Button>
        </Link>
      </div>

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

      <div className="space-y-3">
        {appointments.map((appt) => (
          <div key={appt.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{appt.type}</p>
              <StatusBadge status={APPOINTMENT_STATUS_MAP[appt.status]}>
                {appt.status}
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {appt.appointmentDate} at {appt.timeSlot}
              {appt.productName ? ` · ${appt.productName}` : ""}
            </p>

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
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No appointments yet.{" "}
            <Link href="/my/appointments/new" className="text-primary underline">
              Book one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}