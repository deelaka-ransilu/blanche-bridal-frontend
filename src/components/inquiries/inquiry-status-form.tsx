"use client";

import { useTransition } from "react";
import { updateInquiryStatusAction } from "@/lib/actions/inquiries";
import type { InquiryStatus } from "@/types/inquiry";
import { cn } from "@/lib/utils";

const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export function InquiryStatusForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: InquiryStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: InquiryStatus) {
    if (status === currentStatus) return;
    const formData = new FormData();
    formData.set("status", status);
    startTransition(() => {
      updateInquiryStatusAction(id, formData);
    });
  }

  return (
    <div className="flex gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={isPending}
          onClick={() => setStatus(s.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
            currentStatus === s.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}