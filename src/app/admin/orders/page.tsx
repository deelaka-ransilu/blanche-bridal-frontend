"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { getAllOrders } from "@/lib/api/orders";
import { OrderResponse, OrderStatus } from "@/types";

const ALL_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllOrders(token, activeTab === "ALL" ? undefined : activeTab).then(
      (res) => {
        if (res.success && res.data) setOrders(res.data);
        setLoading(false);
      },
    );
  }, [token, activeTab, status]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
        Orders
      </h1>

      <div className="overflow-x-auto pb-1 mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit min-w-max">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No orders</p>
          <p className="text-sm text-muted-foreground">
            No {activeTab === "ALL" ? "" : activeTab.toLowerCase() + " "}
            orders found.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs sm:text-sm font-semibold text-amber-700">
                  LKR {order.totalAmount.toLocaleString()}
                </p>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
