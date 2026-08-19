"use client";

import { AppointmentsCalendarView } from "@/components/bookings/appointments-calendar-view";
import { AppointmentsListView } from "@/components/bookings/appointments-list-view";
import type { Appointment } from "@/types/appointment";

export function AppointmentsPanel({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="space-y-6">
      <AppointmentsCalendarView appointments={appointments} />
      <AppointmentsListView appointments={appointments} />
    </div>
  );
}