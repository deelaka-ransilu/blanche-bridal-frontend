import { getAllAppointments } from "@/lib/api/appointments";
import { AppointmentsCalendarView } from "@/components/bookings/appointments-calendar-view";

export async function AppointmentsView() {
  const result = await getAllAppointments();
  const appointments = result.success ? result.data : [];

  return (
    <div className="space-y-2">
      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}
      <AppointmentsCalendarView appointments={appointments} />
    </div>
  );
}