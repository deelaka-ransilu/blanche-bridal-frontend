"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const BOOKING_PATH = "/my/appointments/new";

interface BookFittingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function BookFittingButton({
  className,
  children = "Book a fitting",
}: BookFittingButtonProps) {
  const { status } = useSession();
  const router = useRouter();

  function handleClick() {
    if (status === "authenticated") {
      router.push(BOOKING_PATH);
      return;
    }

    // Not logged in (or still loading) — send to login, then bounce
    // back to the booking page once signed in.
    const callbackUrl = encodeURIComponent(BOOKING_PATH);
    router.push(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}