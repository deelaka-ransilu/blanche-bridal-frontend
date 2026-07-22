// components/admin/quote-history-toggle.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function QuoteHistoryToggle({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <span>View {count} previous version{count > 1 ? "s" : ""}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}