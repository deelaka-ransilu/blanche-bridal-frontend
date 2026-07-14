"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelRentalAction } from "@/lib/actions/rentals";
import { Button } from "@/components/ui/button";

export function CancelRentalButton({ rentalId }: { rentalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!confirm("Cancel this rental booking? This can't be undone.")) return;
    startTransition(async () => {
      const result = await cancelRentalAction(rentalId);
      if (result?.success) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="w-full rounded-xl border border-status-cancelled/40 bg-transparent py-2.5 text-sm font-medium text-status-cancelled transition hover:bg-status-cancelled/5"
    >
      {isPending ? "Cancelling..." : "Cancel rental"}
    </Button>
  );
}