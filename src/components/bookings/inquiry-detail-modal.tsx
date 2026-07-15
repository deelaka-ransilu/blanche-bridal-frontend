"use client";

import { Mail, Phone, ImageIcon, X } from "lucide-react";
import { InquiryStatusForm } from "@/components/inquiries/inquiry-status-form";
import { InquiryReplyForm } from "@/components/inquiries/inquiry-reply-form";
import { formatDate } from "@/lib/utils";
import type { Inquiry } from "@/types/inquiry";

export function InquiryDetailModal({
  inquiry,
  onClose,
}: {
  inquiry: Inquiry;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {inquiry.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-heading text-base font-medium text-foreground">
                {inquiry.subject || "General Inquiry"}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(85vh-72px)] space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{inquiry.name}</span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {inquiry.email}
            </span>
            {inquiry.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {inquiry.phone}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground">{inquiry.message}</p>
            {inquiry.imageUrl && (
              <a
                href={inquiry.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <img
                  src={inquiry.imageUrl}
                  alt="Attached reference"
                  className="mt-2 block max-w-[220px] rounded-lg border border-border"
                />
              </a>
            )}
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2.5 text-sm font-medium text-foreground">Status</h3>
            <InquiryStatusForm id={inquiry.id} currentStatus={inquiry.status} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-1 text-sm font-medium text-foreground">Reply</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Reply is emailed directly to the customer and not stored — this app won&apos;t show
              past replies.
            </p>
            <InquiryReplyForm id={inquiry.id} />
          </div>
        </div>
      </div>
    </div>
  );
}