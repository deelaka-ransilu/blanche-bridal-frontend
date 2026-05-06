"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getAllInquiries } from "@/lib/api/inquiries";
import { InquiryResponse, InquiryStatus } from "@/types";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabStatus = InquiryStatus | "ALL";

const ALL_STATUSES: TabStatus[] = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"];

const STATUS_BADGE: Record<InquiryStatus, string> = {
  OPEN:        "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED:    "bg-emerald-100 text-emerald-700",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
};

const TAB_LABEL: Record<TabStatus, string> = {
  ALL:         "All",
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
};

/** Colour of the icon box per status */
const STATUS_ICON_COLOR: Record<InquiryStatus, string> = {
  OPEN:        "text-amber-500",
  IN_PROGRESS: "text-blue-500",
  RESOLVED:    "text-emerald-500",
};

/** Short abbreviation shown inside the icon box */
const STATUS_ABBR: Record<InquiryStatus, string> = {
  OPEN:        "NEW",
  IN_PROGRESS: "WIP",
  RESOLVED:    "RES",
};

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [tab, setTab]           = useState<TabStatus>("ALL");
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading]   = useState(true);

  // ── Counts per status (computed from full list) ──────────────────────────────
  const openCount       = inquiries.filter((i) => i.status === "OPEN").length;
  const inProgressCount = inquiries.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount   = inquiries.filter((i) => i.status === "RESOLVED").length;

  const tabCount: Partial<Record<TabStatus, number>> = {
    ALL:         inquiries.length,
    OPEN:        openCount,
    IN_PROGRESS: inProgressCount,
    RESOLVED:    resolvedCount,
  };

  const tabBadgeStyle: Partial<Record<TabStatus, string>> = {
    OPEN:        "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
  };

  // ── Displayed list ───────────────────────────────────────────────────────────
  const currentList =
    tab === "ALL" ? inquiries : inquiries.filter((i) => i.status === tab);

  // ── Data loading — always fetch ALL, filter client-side ──────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!token) { setLoading(false); return; }
    setLoading(true);
    getAllInquiries(token).then((res) => {
      if (res.success && res.data) setInquiries(res.data);
      setLoading(false);
    });
  }, [token, status]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            {inquiries.length} total
            {openCount > 0 && `, ${openCount} open`}
          </p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
          {ALL_STATUSES.map((t) => {
            const count    = tabCount[t] ?? 0;
            const badgeCls = tabBadgeStyle[t] ?? "bg-gray-100 text-gray-600";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {TAB_LABEL[t]}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {tab === "ALL"
              ? "No inquiries found."
              : `No ${TAB_LABEL[tab].toLowerCase()} inquiries.`}
          </div>
        ) : (
          <div className="divide-y">
            {currentList.map((inq) => {
              const isMuted = inq.status === "RESOLVED";
              return (
                <div
                  key={inq.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  {/* Status icon box — mirrors the appointment type box */}
                  <div
                    className={`relative w-9 h-11 sm:w-10 sm:h-12 bg-gray-100 rounded-md overflow-hidden shrink-0 flex flex-col items-center justify-center gap-0.5 ${isMuted ? "opacity-40" : ""}`}
                  >
                    <MessageCircleQuestion
                      className={`size-4 ${STATUS_ICON_COLOR[inq.status]}`}
                    />
                    <span className={`text-[9px] font-bold tracking-wide ${STATUS_ICON_COLOR[inq.status]}`}>
                      {STATUS_ABBR[inq.status]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Status badge + date */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[inq.status]}`}>
                        {STATUS_LABEL[inq.status]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString("en-LK", {
                          year:  "numeric",
                          month: "short",
                          day:   "numeric",
                        })}
                      </span>
                    </div>

                    {/* Subject */}
                    <p className={`text-sm font-medium truncate ${isMuted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {inq.subject ?? "(No subject)"}
                    </p>

                    {/* Sender */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inq.name}
                      {inq.email && (
                        <span className="ml-1.5">· {inq.email}</span>
                      )}
                    </p>
                  </div>

                  {/* Detail chevron — always present */}
                  <Link href={`/admin/inquiries/${inq.id}`} className="shrink-0">
                    <Button variant="ghost" size="sm">
                      <svg
                        className="size-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}