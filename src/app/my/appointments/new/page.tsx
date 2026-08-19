import { redirect } from "next/navigation";

// This page moved to a public route so guests can view/fill the booking
// form without being forced to log in first (login is now only required
// at the "Confirm booking" step, inside BookAppointmentForm). This file
// stays only as a redirect for any stale links/bookmarks pointing here.
export default function LegacyNewAppointmentPage() {
  redirect("/appointments/new");
}