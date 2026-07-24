// src/components/shared/confirm-dialog.tsx
"use client";

import type { LucideIcon } from "lucide-react";

export function ConfirmDialog({
  icon: Icon,
  iconWrapClass,
  iconClass,
  confirmButtonClass,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  icon: LucideIcon;
  iconWrapClass: string; // e.g. "bg-status-completed/15"
  iconClass: string; // e.g. "text-status-completed"
  confirmButtonClass: string; // e.g. "bg-status-completed hover:bg-status-completed/90"
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg"
      >
        <div className="mb-3 flex items-start gap-2.5">
          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}>
            <Icon className={`h-4 w-4 ${iconClass}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}