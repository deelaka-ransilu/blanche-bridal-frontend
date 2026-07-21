"use client";

import { useTransition } from "react";
import { cancelRentalAction } from "@/lib/actions/rentals";

export function CancelRentalButton({ rentalId }: { rentalId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Cancel this rental booking? This can't be undone.")) return;
    startTransition(() => {
      cancelRentalAction(rentalId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-lg border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {isPending ? "Cancelling…" : "Cancel booking"}
    </button>
  );
}