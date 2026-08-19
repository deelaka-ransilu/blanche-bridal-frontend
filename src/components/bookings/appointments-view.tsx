import { getAllAppointments } from "@/lib/api/engagement/appointments";
import { AppointmentsPanel } from "@/components/bookings/appointments-panel";

export async function AppointmentsView() {
  const result = await getAllAppointments();
  const appointments = result.success ? result.data : [];

  return (
    <div className="space-y-2">
      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}
      <AppointmentsPanel appointments={appointments} />
    </div>
  );
}