"use client";

import { useRouter } from "next/navigation";

const BOOKING_PATH = "/appointments/new";

interface BookFittingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function BookFittingButton({
  className,
  children = "Book an appointment",
}: BookFittingButtonProps) {
  const router = useRouter();

  function handleClick() {
    // Page is public now — no auth gate here. Login (if needed) is
    // deferred until the user actually tries to confirm a booking,
    // handled inside BookAppointmentForm itself.
    router.push(BOOKING_PATH);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}