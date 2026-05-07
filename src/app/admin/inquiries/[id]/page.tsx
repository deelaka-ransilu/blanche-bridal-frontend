"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { getInquiryById, updateInquiryStatus, sendInquiryReply } from "@/lib/api/inquiries";
import { InquiryResponse, InquiryStatus } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─── badge config ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<InquiryStatus, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const router = useRouter();

  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  // ── reply state ────────────────────────────────────────────────────────────
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!token || !id) {
      setLoading(false);
      return;
    }
    getInquiryById(id, token).then((res) => {
      if (res.success && res.data) setInquiry(res.data);
      setLoading(false);
    });
  }, [id, token, status]);

  async function handleStatus(newStatus: InquiryStatus) {
    if (!token || !inquiry) return;
    setActioning(true);
    try {
      const res = await updateInquiryStatus(inquiry.id, newStatus, token);
      if (res.success && res.data) {
        setInquiry(res.data);
        toast.success(`Inquiry marked as ${STATUS_LABEL[newStatus]}.`);

        // Redirect back to list only when fully resolved
        if (newStatus === "RESOLVED") {
          setTimeout(() => router.push("/admin/inquiries"), 1000);
        }
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setActioning(false);
    }
  }

  async function handleReply() {
    if (!token || !inquiry || !replyMessage.trim()) return;
    setSending(true);
    try {
      const res = await sendInquiryReply(inquiry.id, replyMessage, token);
      if (res.success) {
        toast.success("Reply sent to customer.");
        setReplyMessage("");
        setReplyOpen(false);
        // Refresh inquiry to reflect possible status change (OPEN → IN_PROGRESS)
        const updated = await getInquiryById(id, token);
        if (updated.success && updated.data) setInquiry(updated.data);
      } else {
        toast.error("Failed to send reply.");
      }
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Inquiry not found.</p>
        <Link href="/admin/inquiries">
          <Button variant="outline" className="mt-4">
            Back to Inquiries
          </Button>
        </Link>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inquiries
      </Link>

      {/* Header card */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {inquiry.subject ?? "(No subject)"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Received{" "}
              {new Date(inquiry.createdAt).toLocaleDateString("en-LK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[inquiry.status]}`}
          >
            {STATUS_LABEL[inquiry.status]}
          </span>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
            <p className="font-medium">{inquiry.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <p className="font-medium text-amber-700 break-all">{inquiry.email}</p>
          </div>
          {inquiry.phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
              <p className="font-medium">{inquiry.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Message</h2>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {inquiry.message}
        </p>
      </div>

      {/* Reference image */}
      {inquiry.imageUrl && (
        <div className="bg-white border rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Reference Photo
          </h2>
          <div className="relative w-full max-w-sm aspect-4/3 rounded-lg overflow-hidden border">
            <Image
              src={inquiry.imageUrl}
              alt="Reference photo"
              fill
              className="object-cover"
            />
          </div>
          <a
            href={inquiry.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open full size
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Actions</h2>

        <div className="flex flex-wrap gap-3">

          {/* ── Reply panel ── */}
          {replyOpen ? (
            <div className="w-full space-y-3">
              <p className="text-xs text-muted-foreground">
                Replying to <span className="font-medium text-gray-700">{inquiry.email}</span>
              </p>
              <textarea
                className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                rows={5}
                placeholder="Type your reply to the customer..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                  disabled={sending || !replyMessage.trim()}
                  onClick={handleReply}
                >
                  {sending ? "Sending..." : "Send Reply"}
                </Button>
                <Button
                  variant="outline"
                  disabled={sending}
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyMessage("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setReplyOpen(true)}
            >
              <Mail className="w-4 h-4" />
              Reply to Customer
            </Button>
          )}

          {/* ── Status transitions ── */}
          {!replyOpen && (
            <>
              {inquiry.status === "OPEN" && (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={actioning}
                    onClick={() => handleStatus("IN_PROGRESS")}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actioning}
                    onClick={() => handleStatus("RESOLVED")}
                  >
                    Mark Resolved
                  </Button>
                </>
              )}

              {inquiry.status === "IN_PROGRESS" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={actioning}
                  onClick={() => handleStatus("RESOLVED")}
                >
                  Mark Resolved
                </Button>
              )}

              {inquiry.status === "RESOLVED" && (
                <p className="text-sm text-muted-foreground self-center">
                  This inquiry has been resolved.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
