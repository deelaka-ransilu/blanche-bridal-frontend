"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { getAllOrders } from "@/lib/api/orders";
import { OrderResponse, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";

type TabStatus = OrderStatus | "ALL";

const ALL_STATUSES: TabStatus[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING:   "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_ICON_COLOR: Record<OrderStatus, string> = {
  PENDING:   "text-gray-500",
  CONFIRMED: "text-blue-500",
  COMPLETED: "text-emerald-500",
  CANCELLED: "text-red-400",
};

const STATUS_ABBR: Record<OrderStatus, string> = {
  PENDING:   "NEW",
  CONFIRMED: "CNF",
  COMPLETED: "DON",
  CANCELLED: "CXL",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;
  const router = useRouter();

  const [tab, setTab]       = useState<TabStatus>("ALL");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Counts per status ────────────────────────────────────────────────────────
  const pendingCount   = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  const tabCount: Partial<Record<TabStatus, number>> = {
    ALL:       orders.length,
    PENDING:   pendingCount,
    CONFIRMED: confirmedCount,
    COMPLETED: completedCount,
    CANCELLED: cancelledCount,
  };

  const tabBadgeStyle: Partial<Record<TabStatus, string>> = {
    PENDING:   "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  // ── Displayed list ───────────────────────────────────────────────────────────
  const currentList =
    tab === "ALL" ? orders : orders.filter((o) => o.status === tab);

  // ── Data loading — fetch ALL once, filter client-side ────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!token) { setLoading(false); return; }
    setLoading(true);
    getAllOrders(token).then((res) => {
      if (res.success && res.data) setOrders(res.data);
      setLoading(false);
    });
  }, [token, status]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} total
            {pendingCount > 0 && `, ${pendingCount} pending`}
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
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
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
              ? "No orders found."
              : `No ${tab.toLowerCase()} orders.`}
          </div>
        ) : (
          <div className="divide-y">
            {currentList.map((order) => {
              const isMuted = order.status === "CANCELLED";
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  {/* Status icon box */}
                  <div
                    className={`relative w-9 h-11 sm:w-10 sm:h-12 bg-gray-100 rounded-md overflow-hidden shrink-0 flex flex-col items-center justify-center gap-0.5 ${isMuted ? "opacity-40" : ""}`}
                  >
                    <Package className={`size-4 ${STATUS_ICON_COLOR[order.status]}`} />
                    <span className={`text-[9px] font-bold tracking-wide ${STATUS_ICON_COLOR[order.status]}`}>
                      {STATUS_ABBR[order.status]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Status badge + order ID */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Date + item count */}
                    <p className={`text-sm font-medium truncate ${isMuted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {new Date(order.createdAt).toLocaleDateString("en-LK", {
                        weekday: "short",
                        year:    "numeric",
                        month:   "short",
                        day:     "numeric",
                      })}
                    </p>

                    {/* Item count + amount */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      {!isMuted && (
                        <span className="ml-1.5 text-amber-700 font-medium">
                          · LKR {order.totalAmount.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Detail chevron */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}