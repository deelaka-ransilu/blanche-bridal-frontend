"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Review, ReviewStatus } from "@/types";
import {
  getReviewsByStatus,
  approveReview,
  rejectReview,
} from "@/lib/api/products";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";

const TABS: { label: string; value: ReviewStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={`size-3.5 ${
            i <= rating ? "text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [activeTab, setActiveTab] = useState<ReviewStatus>("PENDING");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: "approve" | "reject";
  } | null>(null);

  const load = useCallback(
    async (status: ReviewStatus) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getReviewsByStatus(status, token);
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  async function handleAction(id: string, type: "approve" | "reject") {
    if (!token) return;
    setActionId(id);
    try {
      if (type === "approve") {
        await approveReview(id, token);
      } else {
        await rejectReview(id, token);
      }
      // Remove from current list (it changed status)
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
      setConfirmAction(null);
    }
  }

  const pendingCount = activeTab === "PENDING" ? reviews.length : null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          {/* Page header */}
          <div>
            <h2 className="text-xl font-semibold">Reviews</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Moderate customer reviews before they appear on the catalog
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.value
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-muted-foreground hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.value === "PENDING" &&
                  pendingCount != null &&
                  pendingCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 min-w-[20px]">
                      {pendingCount}
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-white overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No {activeTab.toLowerCase()} reviews.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Reviewer</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Rating</th>
                      <th className="px-4 py-3 text-left">Comment</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      {activeTab === "PENDING" && (
                        <th className="px-4 py-3 text-right">Actions</th>
                      )}
                      {activeTab !== "PENDING" && (
                        <th className="px-4 py-3 text-center">Status</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reviews.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Reviewer */}
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {r.reviewerName}
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3">
                          {r.productId ? (
                            <Link
                              href={`/admin/inventory/${r.productId}`}
                              className="text-amber-700 hover:underline whitespace-nowrap"
                            >
                              {r.productName ?? "View product"}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3">
                          <StarDisplay rating={r.rating} />
                        </td>

                        {/* Comment */}
                        <td className="px-4 py-3 max-w-xs">
                          {r.comment ? (
                            <p className="text-gray-700 line-clamp-2">
                              {r.comment}
                            </p>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">
                              No comment
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions — Pending only */}
                        {activeTab === "PENDING" && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600"
                                title="Approve"
                                onClick={() =>
                                  setConfirmAction({
                                    id: r.id,
                                    type: "approve",
                                  })
                                }
                              >
                                <HugeiconsIcon
                                  icon={CheckmarkCircle01Icon}
                                  className="size-4"
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                                title="Reject"
                                onClick={() =>
                                  setConfirmAction({
                                    id: r.id,
                                    type: "reject",
                                  })
                                }
                              >
                                <HugeiconsIcon
                                  icon={CancelCircleIcon}
                                  className="size-4"
                                />
                              </Button>
                            </div>
                          </td>
                        )}

                        {/* Status badge — Approved / Rejected tabs */}
                        {activeTab !== "PENDING" && (
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                r.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                              }`}
                            >
                              {r.status === "APPROVED"
                                ? "Approved"
                                : "Rejected"}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {confirmAction.type === "approve"
                ? "Approve this review?"
                : "Reject this review?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {confirmAction.type === "approve"
                ? "The review will become visible on the product page immediately."
                : "The review will be hidden and the customer will not be notified."}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                className={
                  confirmAction.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
                disabled={actionId === confirmAction.id}
                onClick={() =>
                  handleAction(confirmAction.id, confirmAction.type)
                }
              >
                {actionId === confirmAction.id
                  ? confirmAction.type === "approve"
                    ? "Approving…"
                    : "Rejecting…"
                  : confirmAction.type === "approve"
                    ? "Approve"
                    : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
