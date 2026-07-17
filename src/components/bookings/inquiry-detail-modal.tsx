"use client";

import { Mail, Phone, ImageIcon, X, Clock, MessageCircleReply } from "lucide-react";
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {inquiry.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-heading text-base font-medium text-foreground">
                {inquiry.subject || "General Inquiry"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(inquiry.createdAt)}
              </p>
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

        <div className="max-h-[calc(85vh-72px)] space-y-5 overflow-y-auto p-5">
          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="font-medium text-foreground">{inquiry.name}</span>
            <a
              href={`mailto:${inquiry.email}`}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5" />
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <a
                href={`tel:${inquiry.phone}`}
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                {inquiry.phone}
              </a>
            )}
          </div>

          {/* Original message */}
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Message
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {inquiry.message}
            </p>
            {inquiry.imageUrl && (
              <a
                href={inquiry.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Attached reference
                <img
                  src={inquiry.imageUrl}
                  alt="Attached reference"
                  className="mt-2 block max-w-[220px] rounded-lg border border-border"
                />
              </a>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <InquiryStatusForm id={inquiry.id} currentStatus={inquiry.status} />
          </div>

          <div className="h-px bg-border" />

          {/* Reply — primary action, visually emphasized */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircleReply className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Reply to customer</h3>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Sent directly to <span className="font-medium text-foreground">{inquiry.email}</span> by
              email — not stored, so this app won&apos;t show past replies.
            </p>
            <InquiryReplyForm id={inquiry.id} />
          </div>
        </div>
      </div>
    </div>
  );
}