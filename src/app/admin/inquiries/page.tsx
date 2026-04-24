"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getAllInquiries } from "@/lib/api/inquiries";
import { InquiryResponse, InquiryStatus } from "@/types";
import { ChevronRight, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── badge config ─────────────────────────────────────────────────────────────

const ALL_STATUSES: (InquiryStatus | "ALL")[] = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
];

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

const TAB_LABEL: Record<InquiryStatus | "ALL", string> = {
  ALL: "All",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [activeTab, setActiveTab] = useState<InquiryStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllInquiries(token, activeTab === "ALL" ? undefined : activeTab).then(
      (res) => {
        if (res.success && res.data) setInquiries(res.data);
        setLoading(false);
      },
    );
  }, [token, activeTab, status]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Inquiries</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === s
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABEL[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No inquiries</p>
          <p className="text-sm text-muted-foreground">
            No{" "}
            {activeTab === "ALL"
              ? ""
              : TAB_LABEL[activeTab as InquiryStatus].toLowerCase() + " "}
            inquiries found.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[inq.status]}`}
                  >
                    {STATUS_LABEL[inq.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inq.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {inq.subject ?? "(No subject)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inq.name} · {inq.email}
                </p>
              </div>

              {/* View */}
              <Link href={`/admin/inquiries/${inq.id}`}>
                <Button size="sm" variant="ghost" className="px-2">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
