"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { getMyRentals } from "@/lib/api/rentals";
import { RentalResponse, RentalStatus } from "@/types";

// ── Badge config ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<RentalStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-600",
};

const ROW_BG: Record<RentalStatus, string> = {
  ACTIVE: "",
  OVERDUE: "bg-amber-50 border-amber-200",
  RETURNED: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyRentalsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    getMyRentals(token).then((res) => {
      if (res.success && res.data) setRentals(res.data);
      setLoading(false);
    });
  }, [token, status]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Page ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Rentals</h1>

      {rentals.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Shirt className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No rentals yet</p>
          <p className="text-sm text-muted-foreground">
            Browse our collection and book a rental appointment.
          </p>
          <Link
            href="/booking"
            className="inline-block mt-2 text-sm text-amber-700 hover:underline"
          >
            Book an Appointment →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className={`flex items-center gap-4 bg-white border rounded-xl px-5 py-4 transition-all ${ROW_BG[rental.status]}`}
            >
              {/* Thumbnail */}
              {rental.productImage ? (
                <img
                  src={rental.productImage}
                  alt={rental.productName || "Product"}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Shirt className="w-5 h-5 text-gray-400" />
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

              {/* Balance due */}
              <div className="text-right shrink-0">
                {rental.balanceDue > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Balance due
                    </p>
                    <p className="text-sm font-semibold text-red-600">
                      LKR {rental.balanceDue.toLocaleString()}
                    </p>
                  </div>
                ) : rental.depositAmount ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Deposit
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      LKR {rental.depositAmount.toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
