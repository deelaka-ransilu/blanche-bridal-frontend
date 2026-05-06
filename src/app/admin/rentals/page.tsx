"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Shirt, ChevronRight, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { getAllRentals, markReturned, updateBalance } from "@/lib/api/rentals";
import { RentalResponse, RentalStatus } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Constants ─────────────────────────────────────────────────────────────────

type TabStatus = RentalStatus | "ALL";

const ALL_TABS: TabStatus[] = ["ALL", "ACTIVE", "OVERDUE", "RETURNED"];

const STATUS_BADGE: Record<RentalStatus, string> = {
  ACTIVE:   "bg-emerald-100 text-emerald-700",
  OVERDUE:  "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<RentalStatus, string> = {
  ACTIVE:   "Active",
  OVERDUE:  "Overdue",
  RETURNED: "Returned",
};

const TAB_BADGE: Partial<Record<TabStatus, string>> = {
  ACTIVE:  "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-600",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LK", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function fmtLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function daysOverdue(rentalEnd: string) {
  const diff = Math.floor(
    (Date.now() - new Date(rentalEnd).getTime()) / 86_400_000,
  );
  return diff > 0 ? diff : 0;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRentalsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [rentals, setRentals]         = useState<RentalResponse[]>([]);
  const [tab, setTab]                 = useState<TabStatus>("ALL");
  const [loading, setLoading]         = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [balanceDraft, setBalanceDraft] = useState<Record<string, string>>({});

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!token) { setLoading(false); return; }
    setLoading(true);
    // Always fetch ALL and filter client-side so counts stay accurate
    getAllRentals(token).then((res) => {
      if (res.success && res.data) setRentals(res.data);
      setLoading(false);
    });
  }, [token, status]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const activeCount   = rentals.filter((r) => r.status === "ACTIVE").length;
  const overdueCount  = rentals.filter((r) => r.status === "OVERDUE").length;
  const returnedCount = rentals.filter((r) => r.status === "RETURNED").length;
  const totalBalance  = rentals
    .filter((r) => r.status !== "RETURNED")
    .reduce((sum, r) => sum + (r.balanceDue ?? 0), 0);

  const tabCount: Record<TabStatus, number> = {
    ALL:      rentals.length,
    ACTIVE:   activeCount,
    OVERDUE:  overdueCount,
    RETURNED: returnedCount,
  };

  const currentList =
    tab === "ALL" ? rentals : rentals.filter((r) => r.status === tab);

  // ── Actions ───────────────────────────────────────────────────────────────
  function patchRental(updated: RentalResponse) {
    setRentals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleMarkReturned(id: string) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await markReturned(id, new Date().toISOString().split("T")[0], token);
      if (res.success && res.data) {
        patchRental(res.data);
        toast.success("Rental marked as returned.");
      }
    } catch { toast.error("Failed to mark as returned."); }
    finally { setActioningId(null); }
  }

  async function handleUpdateBalance(id: string) {
    if (!token) return;
    const value = parseFloat(balanceDraft[id]);
    if (isNaN(value) || value < 0) { toast.error("Enter a valid amount."); return; }
    setActioningId(id);
    try {
      const res = await updateBalance(id, value, token);
      if (res.success && res.data) {
        patchRental(res.data);
        setBalanceDraft((prev) => { const n = { ...prev }; delete n[id]; return n; });
        toast.success("Balance updated.");
      }
    } catch { toast.error("Failed to update balance."); }
    finally { setActioningId(null); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Rentals</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : (
              <>
                {rentals.length} total
                {overdueCount > 0 && (
                  <span className="ml-1.5 text-red-600 font-medium">
                    · {overdueCount} overdue
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Summary stat pills ── */}
      {!loading && rentals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Active */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Active</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{activeCount}</p>
          </div>

          {/* Overdue */}
          <div className={`rounded-xl border px-4 py-3 ${overdueCount > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${overdueCount > 0 ? "text-red-700" : "text-gray-500"}`}>Overdue</p>
            <p className={`text-2xl font-bold mt-0.5 ${overdueCount > 0 ? "text-red-700" : "text-gray-400"}`}>{overdueCount}</p>
          </div>

          {/* Returned */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Returned</p>
            <p className="text-2xl font-bold text-gray-500 mt-0.5">{returnedCount}</p>
          </div>

          {/* Outstanding balance */}
          <div className={`rounded-xl border px-4 py-3 ${totalBalance > 0 ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${totalBalance > 0 ? "text-amber-700" : "text-gray-500"}`}>Balance Due</p>
            <p className={`text-lg font-bold mt-0.5 truncate ${totalBalance > 0 ? "text-amber-700" : "text-gray-400"}`}>
              {totalBalance > 0 ? fmtLKR(totalBalance) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
          {ALL_TABS.map((t) => {
            const count    = tabCount[t];
            const badgeCls = TAB_BADGE[t] ?? "bg-gray-100 text-gray-600";
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
                {t === "ALL" ? "All" : STATUS_LABEL[t as RentalStatus]}
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

      {/* ── List ── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <Shirt className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">No rentals</p>
            <p className="text-sm text-muted-foreground">
              {tab === "ALL" ? "No rentals found." : `No ${STATUS_LABEL[tab as RentalStatus].toLowerCase()} rentals.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentList.map((rental) => {
              const isOverdue       = rental.status === "OVERDUE";
              const isReturned      = rental.status === "RETURNED";
              const canAct          = !isReturned;
              const isEditing       = balanceDraft[rental.id] !== undefined;
              const overdueDays     = isOverdue ? daysOverdue(rental.rentalEnd) : 0;

              return (
                <div
                  key={rental.id}
                  className={`relative flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors ${
                    isOverdue ? "bg-red-50/60 hover:bg-red-50" : ""
                  }`}
                >
                  {/* Overdue left accent bar */}
                  {isOverdue && (
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-red-400" />
                  )}

                  {/* Product thumbnail */}
                  <div className={`relative shrink-0 w-10 h-12 sm:w-11 sm:h-14 rounded-lg overflow-hidden border border-gray-100 ${isReturned ? "opacity-40" : ""}`}>
                    {rental.productImage ? (
                      <img
                        src={rental.productImage}
                        alt={rental.productName ?? "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Shirt className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + status */}
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={`text-sm font-medium truncate ${isReturned ? "text-gray-400" : "text-gray-900"}`}>
                        {rental.productName}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[rental.status]}`}>
                        {STATUS_LABEL[rental.status]}
                      </span>
                    </div>

                    {/* Customer */}
                    <p className={`text-xs font-medium ${isReturned ? "text-gray-400" : "text-gray-600"}`}>
                      {rental.customerName ?? "—"}
                    </p>

                    {/* Date range */}
                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${isReturned ? "text-gray-300" : "text-muted-foreground"}`}>
                      <span>{fmtDate(rental.rentalStart)}</span>
                      <ArrowLeftRight className="w-2.5 h-2.5 shrink-0" />
                      <span>{fmtDate(rental.rentalEnd)}</span>
                      {isOverdue && overdueDays > 0 && (
                        <span className="ml-1 flex items-center gap-0.5 text-red-600 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {overdueDays}d late
                        </span>
                      )}
                    </p>

                    {/* Return date */}
                    {rental.returnDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Returned {fmtDate(rental.returnDate)}
                      </p>
                    )}
                  </div>

                  {/* Balance column */}
                  <div className="hidden sm:block shrink-0 text-right min-w-[80px]">
                    {rental.balanceDue > 0 ? (
                      <p className="text-sm font-semibold text-red-600">
                        {fmtLKR(rental.balanceDue)}
                      </p>
                    ) : rental.depositAmount != null ? (
                      <p className="text-xs text-muted-foreground">
                        Dep. {fmtLKR(rental.depositAmount)}
                      </p>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

                    {/* Mark returned */}
                    {canAct && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2.5"
                            disabled={actioningId === rental.id}
                          >
                            Return
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Mark as Returned?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark{" "}
                              <span className="font-medium">{rental.productName}</span>{" "}
                              rented by{" "}
                              <span className="font-medium">{rental.customerName}</span>{" "}
                              as returned today.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleMarkReturned(rental.id)}
                            >
                              Yes, Mark Returned
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Update balance */}
                    {canAct && (
                      isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={balanceDraft[rental.id]}
                            onChange={(e) =>
                              setBalanceDraft((prev) => ({ ...prev, [rental.id]: e.target.value }))
                            }
                            className="h-7 w-20 text-xs px-2"
                            placeholder="0.00"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs px-2"
                            onClick={() => handleUpdateBalance(rental.id)}
                            disabled={actioningId === rental.id}
                          >
                            {actioningId === rental.id ? "…" : "Save"}
                          </Button>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xs transition-colors"
                            onClick={() =>
                              setBalanceDraft((prev) => { const n = { ...prev }; delete n[rental.id]; return n; })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                          onClick={() =>
                            setBalanceDraft((prev) => ({ ...prev, [rental.id]: String(rental.balanceDue ?? 0) }))
                          }
                        >
                          Balance
                        </Button>
                      )
                    )}

                    {/* Detail chevron */}
                    <Link href={`/admin/rentals/${rental.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}