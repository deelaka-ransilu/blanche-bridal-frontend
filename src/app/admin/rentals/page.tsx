"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Shirt, ChevronRight } from "lucide-react";
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

// ── Badge config ──────────────────────────────────────────────────────────────

const ALL_STATUSES: (RentalStatus | "ALL")[] = [
  "ALL",
  "ACTIVE",
  "OVERDUE",
  "RETURNED",
];

const STATUS_BADGE: Record<RentalStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-600",
};

const ROW_BG: Record<RentalStatus, string> = {
  ACTIVE: "",
  OVERDUE: "bg-amber-50",
  RETURNED: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRentalsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Inline balance edit state: rentalId → draft value
  const [balanceDraft, setBalanceDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllRentals(token, activeTab === "ALL" ? undefined : activeTab).then(
      (res) => {
        if (res.success && res.data) setRentals(res.data);
        setLoading(false);
      },
    );
  }, [token, activeTab, status]);

  async function handleMarkReturned(id: string) {
    if (!token) return;
    setActioningId(id);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await markReturned(id, today, token);
      if (res.success && res.data) {
        setRentals((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
        toast.success("Rental marked as returned.");
      }
    } catch {
      toast.error("Failed to mark as returned.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleUpdateBalance(id: string) {
    if (!token) return;
    const raw = balanceDraft[id];
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) {
      toast.error("Enter a valid balance amount.");
      return;
    }
    setActioningId(id);
    try {
      const res = await updateBalance(id, value, token);
      if (res.success && res.data) {
        setRentals((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
        setBalanceDraft((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
        toast.success("Balance updated.");
      }
    } catch {
      toast.error("Failed to update balance.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Rentals</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
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
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Shirt className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No rentals</p>
          <p className="text-sm text-muted-foreground">
            No {activeTab === "ALL" ? "" : activeTab.toLowerCase() + " "}
            rentals found.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {rentals.map((rental) => {
            const canReturn =
              rental.status === "ACTIVE" || rental.status === "OVERDUE";
            const isEditingBalance = balanceDraft[rental.id] !== undefined;

            return (
              <div
                key={rental.id}
                className={`flex items-center gap-4 px-5 py-4 ${ROW_BG[rental.status]}`}
              >
                {/* Thumbnail */}
                {rental.productImage ? (
                  <img
                    src={rental.productImage}
                    alt={rental.productName ?? "Product"}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Shirt className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rental.productName}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[rental.status]}`}
                    >
                      {rental.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rental.customerName ?? "—"} ·{" "}
                    {new Date(rental.rentalStart).toLocaleDateString("en-LK", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    →{" "}
                    {new Date(rental.rentalEnd).toLocaleDateString("en-LK", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {rental.returnDate && (
                    <p className="text-xs text-muted-foreground">
                      Returned:{" "}
                      {new Date(rental.returnDate).toLocaleDateString("en-LK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Balance */}
                <div className="shrink-0 text-right min-w-[100px]">
                  {rental.balanceDue > 0 && (
                    <p className="text-sm font-semibold text-red-600">
                      LKR {rental.balanceDue.toLocaleString()}
                    </p>
                  )}
                  {rental.depositAmount != null && rental.balanceDue === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Deposit: LKR {rental.depositAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Mark returned */}
                  {canReturn && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                            <span className="font-medium">
                              {rental.productName}
                            </span>{" "}
                            rented by{" "}
                            <span className="font-medium">
                              {rental.customerName}
                            </span>{" "}
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

                  {/* Update balance inline */}
                  {canReturn &&
                    (isEditingBalance ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={balanceDraft[rental.id]}
                          onChange={(e) =>
                            setBalanceDraft((prev) => ({
                              ...prev,
                              [rental.id]: e.target.value,
                            }))
                          }
                          className="h-8 w-24 text-sm"
                          placeholder="0.00"
                        />
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white h-8"
                          onClick={() => handleUpdateBalance(rental.id)}
                          disabled={actioningId === rental.id}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() =>
                            setBalanceDraft((prev) => {
                              const n = { ...prev };
                              delete n[rental.id];
                              return n;
                            })
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setBalanceDraft((prev) => ({
                            ...prev,
                            [rental.id]: String(rental.balanceDue ?? 0),
                          }))
                        }
                      >
                        Balance
                      </Button>
                    ))}

                  {/* View detail */}
                  <Link href={`/admin/rentals/${rental.id}`}>
                    <Button size="sm" variant="ghost" className="px-2">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
