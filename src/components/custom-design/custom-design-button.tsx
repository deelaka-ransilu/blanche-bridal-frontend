"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const BOOKING_PATH = "/my/custom-design/new";

interface CustomDesignButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function CustomDesignButton({
  className,
  children = "Design a custom dress",
}: CustomDesignButtonProps) {
  const { status } = useSession();
  const router = useRouter();

  function handleClick() {
    if (status === "authenticated") {
      router.push(BOOKING_PATH);
      return;
    }

    // Not logged in (or still loading) — send to login, then bounce
    // back to the custom-design page once signed in. Same pattern as
    // BookFittingButton.
    const callbackUrl = encodeURIComponent(BOOKING_PATH);
    router.push(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
