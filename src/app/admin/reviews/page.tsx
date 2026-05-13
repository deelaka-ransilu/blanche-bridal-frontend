"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Review, ReviewStatus } from "@/types";
import { getReviewsByStatus, approveReview, rejectReview } from "@/lib/api/products";
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
          className={`size-3.5 ${i <= rating ? "text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

// ── The dialog that was completely missing from the original ──────────────────
function ConfirmDialog({
  type,
  onConfirm,
  onCancel,
  loading,
}: {
  type: "approve" | "reject";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isApprove = type === "approve";
  return (
    // Faux backdrop — covers the page without position:fixed
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border shadow-sm p-6 w-full max-w-sm mx-4">
        <p className="font-medium text-gray-900 mb-1">
          {isApprove ? "Approve this review?" : "Reject this review?"}
        </p>
        <p className="text-sm text-muted-foreground mb-5">
          {isApprove
            ? "It will become visible to customers on the product page."
            : "It will be hidden from the product page."}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={loading}
            onClick={onConfirm}
            className={
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {loading ? "Saving…" : isApprove ? "Approve" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [activeTab, setActiveTab] = useState<ReviewStatus>("PENDING");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
      } catch {
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  // ── This is what was never being called in the original ───────────────────
  async function handleConfirm() {
    if (!token || !confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === "approve") {
        await approveReview(confirmAction.id, token);
        toast.success("Review approved.");
      } else {
        await rejectReview(confirmAction.id, token);
        toast.success("Review rejected.");
      }
      // Optimistically remove from current tab list (status changed)
      setReviews((prev) => prev.filter((r) => r.id !== confirmAction.id));
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  const pendingCount = activeTab === "PENDING" ? reviews.length : null;

  return (
    <div className="flex flex-1 flex-col p-6 gap-6">
      {/* Confirm dialog — rendered conditionally, was missing entirely before */}
      {confirmAction && (
        <ConfirmDialog
          type={confirmAction.type}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

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
            {tab.value === "PENDING" && pendingCount != null && pendingCount > 0 && (
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
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
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
                  {activeTab === "PENDING" ? (
                    <th className="px-4 py-3 text-right">Actions</th>
                  ) : (
                    <th className="px-4 py-3 text-center">Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {r.reviewerName}
                    </td>
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
                    <td className="px-4 py-3">
                      <StarDisplay rating={r.rating} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {r.comment ? (
                        <p className="text-gray-700 line-clamp-2">{r.comment}</p>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">No comment</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {activeTab === "PENDING" ? (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600"
                            title="Approve"
                            onClick={() => setConfirmAction({ id: r.id, type: "approve" })}
                          >
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                            title="Reject"
                            onClick={() => setConfirmAction({ id: r.id, type: "reject" })}
                          >
                            <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                          </Button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {r.status === "APPROVED" ? "Approved" : "Rejected"}
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
  );
}