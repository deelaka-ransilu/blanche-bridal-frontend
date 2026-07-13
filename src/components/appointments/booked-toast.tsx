"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

function BookedToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(searchParams.get("booked") === "true");

  function dismiss() {
    setVisible(false);
    router.replace("/my/appointments");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-card px-6 py-8 text-center shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-completed/10">
          <CheckCircle2 className="h-7 w-7 text-status-completed" />
        </div>
        <p className="font-heading text-lg font-medium text-foreground">Appointment Booked</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll confirm your appointment shortly.
        </p>
      </div>
    </div>
  );
}

export function BookedToast() {
  return (
    <Suspense fallback={null}>
      <BookedToastInner />
    </Suspense>
  );
}