"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Package } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/api/orders";
import { OrderResponse, OrderStatus } from "@/types";

const ALL_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function EmployeeOrdersPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) { setLoading(false); return; }
    setLoading(true);
    getAllOrders(token, activeTab === "ALL" ? undefined : activeTab).then(
      (res) => {
        if (res.success && res.data) setOrders(res.data);
        setLoading(false);
      },
    );
  }, [token, activeTab, status]);

  async function handleStatus(id: string, newStatus: OrderStatus) {
    if (!token) return;
    setActioningId(id);
    try {
      const res = await updateOrderStatus(id, newStatus, token);
      if (res.success && res.data) {
        setOrders((prev) => prev.map((o) => (o.id === id ? res.data! : o)));
        toast.success(`Order marked as ${newStatus.toLowerCase()}.`);
      }
    } catch { toast.error("Failed to update order status."); }
    finally { setActioningId(null); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and process customer orders.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
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
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No orders</p>
          <p className="text-sm text-muted-foreground">
            No {activeTab === "ALL" ? "" : activeTab.toLowerCase() + " "}orders found.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric", month: "short", day: "numeric",
                  })}{" "}
                  · {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
                <p className="text-sm font-semibold text-amber-700">
                  LKR {order.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {order.status === "PENDING" && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleStatus(order.id, "CONFIRMED")}
                    disabled={actioningId === order.id}
                  >
                    Confirm
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatus(order.id, "COMPLETED")}
                    disabled={actioningId === order.id}
                  >
                    Complete
                  </Button>
                )}
                {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={actioningId === order.id}
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cancel order{" "}
                          <span className="font-medium">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep It</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleStatus(order.id, "CANCELLED")}
                        >
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Link href={`/admin/orders/${order.id}`}>
                  <Button size="sm" variant="ghost" className="px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}