"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shirt } from "lucide-react";
import { getRentalById, markReturned, updateBalance } from "@/lib/api/rentals";
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
import { ArrowLeft } from "lucide-react";

// ── Badge config ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<RentalStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-600",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [rental, setRental] = useState<RentalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  // Balance edit
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceDraft, setBalanceDraft] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    getRentalById(id, token).then((res) => {
      if (res.success && res.data) {
        setRental(res.data);
        setBalanceDraft(String(res.data.balanceDue ?? 0));
      }
      setLoading(false);
    });
  }, [token, id]);

  async function handleMarkReturned() {
    if (!token || !rental) return;
    setActioning(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await markReturned(rental.id, today, token);
      if (res.success && res.data) {
        setRental(res.data);
        toast.success("Rental marked as returned.");
      }
    } catch {
      toast.error("Failed to mark as returned.");
    } finally {
      setActioning(false);
    }
  }

  async function handleUpdateBalance() {
    if (!token || !rental) return;
    const value = parseFloat(balanceDraft);
    if (isNaN(value) || value < 0) {
      toast.error("Enter a valid balance amount.");
      return;
    }
    setActioning(true);
    try {
      const res = await updateBalance(rental.id, value, token);
      if (res.success && res.data) {
        setRental(res.data);
        setEditingBalance(false);
        toast.success("Balance updated.");
      }
    } catch {
      toast.error("Failed to update balance.");
    } finally {
      setActioning(false);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-2xl mx-auto">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Rental not found.
      </div>
    );
  }

  const canAct = rental.status === "ACTIVE" || rental.status === "OVERDUE";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rentals
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Rental Detail</h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[rental.status]}`}
        >
          {rental.status}
        </span>
      </div>

      {/* Product card */}
      <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
        {rental.productImage ? (
          <img
            src={rental.productImage}
            alt={rental.productName ?? "Product"}
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Shirt className="w-7 h-7 text-gray-400" />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{rental.productName}</p>
          {rental.orderId && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Order:{" "}
              <span className="font-mono">
                #{rental.orderId.slice(0, 8).toUpperCase()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="bg-white border rounded-xl p-6">
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Customer</p>
            <p className="font-medium text-gray-900">
              {rental.customerName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Rental Period</p>
            <p className="font-medium text-gray-900">
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
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Deposit</p>
            <p className="font-medium text-gray-900">
              {rental.depositAmount != null
                ? `LKR ${rental.depositAmount.toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Balance Due</p>
            <p
              className={`font-semibold ${
                rental.balanceDue > 0 ? "text-red-600" : "text-gray-900"
              }`}
            >
              LKR {rental.balanceDue.toLocaleString()}
            </p>
          </div>
          {rental.returnDate && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Return Date</p>
              <p className="font-medium text-gray-900">
                {new Date(rental.returnDate).toLocaleDateString("en-LK", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p className="font-medium text-gray-900">
              {new Date(rental.createdAt).toLocaleDateString("en-LK", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          {rental.notes && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-gray-800">{rental.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {canAct && (
        <div className="space-y-4">
          {/* Mark returned */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Mark as Returned
            </h2>
            <p className="text-xs text-muted-foreground">
              Records today's date as the actual return date and sets status to
              RETURNED.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={actioning}
                >
                  Mark Returned
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark as Returned?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will record today as the return date for{" "}
                    <span className="font-medium">{rental.productName}</span>{" "}
                    and set the status to RETURNED.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleMarkReturned}
                  >
                    Yes, Mark Returned
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Update balance */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Update Balance Due
            </h2>
            <p className="text-xs text-muted-foreground">
              Set any outstanding amount owed by the customer (e.g. late fees or
              damage charges).
            </p>
            {editingBalance ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">LKR</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={balanceDraft}
                  onChange={(e) => setBalanceDraft(e.target.value)}
                  className="w-36"
                  placeholder="0.00"
                />
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleUpdateBalance}
                  disabled={actioning}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingBalance(false);
                    setBalanceDraft(String(rental.balanceDue ?? 0));
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-900">
                  LKR {rental.balanceDue.toLocaleString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBalance(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
