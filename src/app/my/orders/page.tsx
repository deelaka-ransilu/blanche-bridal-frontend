"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { getMyOrders } from "@/lib/api/orders";
import { OrderResponse, OrderStatus } from "@/types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token as string;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getMyOrders(token).then((res) => {
      if (res.success && res.data) setOrders(res.data);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Browse our collection and place your first order.
          </p>
          <Link
            href="/catalog"
            className="inline-block mt-2 text-sm text-amber-700 hover:underline"
          >
            Browse Catalog →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/my/orders/${order.id}`}
              className="flex items-center justify-between bg-white border rounded-xl px-5 py-4 hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
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

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-amber-700">
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
