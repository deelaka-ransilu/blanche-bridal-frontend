"use client";

import { useMemo, useState } from "react";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { InquiryDetailModal } from "@/components/bookings/inquiry-detail-modal";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const INQUIRY_STATUS_MAP: Record<InquiryStatus, Status> = {
  OPEN: "pending",
  IN_PROGRESS: "progress",
  RESOLVED: "completed",
};

const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const FILTERS: { key: "ALL" | InquiryStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
];

export function InquiriesListClient({ inquiries }: { inquiries: Inquiry[] }) {
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<"ALL" | InquiryStatus>("ALL");

  const counts = useMemo(() => {
    return {
      OPEN: inquiries.filter((i) => i.status === "OPEN").length,
      IN_PROGRESS: inquiries.filter((i) => i.status === "IN_PROGRESS").length,
      RESOLVED: inquiries.filter((i) => i.status === "RESOLVED").length,
    };
  }, [inquiries]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return inquiries;
    return inquiries.filter((i) => i.status === filter);
  }, [inquiries, filter]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{counts.OPEN}</span> open ·{" "}
          <span className="font-medium text-foreground">{counts.IN_PROGRESS}</span> in progress ·{" "}
          <span className="font-medium text-foreground">{counts.RESOLVED}</span> resolved
        </p>

        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                filter === f.key
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No {filter === "ALL" ? "" : INQUIRY_STATUS_LABEL[filter as InquiryStatus].toLowerCase() + " "}
            inquiries.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {filtered.map((inquiry, i) => {
            const isUnactioned = inquiry.status === "OPEN";

            return (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setSelected(inquiry)}
                className={`group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-primary/5 ${
                  i !== 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {inquiry.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p
                      className={`truncate text-sm ${
                        isUnactioned ? "font-semibold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {inquiry.name}
                    </p>
                    <span className="truncate text-xs text-muted-foreground/70">{inquiry.email}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm italic !text-muted-foreground/80">
                    &ldquo;{inquiry.subject || inquiry.message}&rdquo;
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 border-l border-border pl-4">
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={INQUIRY_STATUS_MAP[inquiry.status]}>
                      {INQUIRY_STATUS_LABEL[inquiry.status]}
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && <InquiryDetailModal inquiry={selected} onClose={() => setSelected(null)} />}
    </>
  );
}