"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, FileText, Loader2 } from "lucide-react";
import {
  getOrderById,
  getMyReceipts,
  getReceiptPdfUrl,
} from "@/lib/api/orders";
import { OrderResponse, OrderStatus, ReceiptResponse } from "@/types";
import { Button } from "@/components/ui/button";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MyOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([getOrderById(id, token), getMyReceipts(token)]).then(
      ([orderRes, receiptsRes]) => {
        if (orderRes.success && orderRes.data) setOrder(orderRes.data);
        if (receiptsRes.success && receiptsRes.data) {
          const match = receiptsRes.data.find((r) => r.orderId === id);
          if (match) setReceipt(match);
        }
        setLoading(false);
      },
    );
  }, [token, id]);

  async function handleDownload() {
    if (!receipt || !token) return;
    setDownloadLoading(true);
    try {
      const res = await getReceiptPdfUrl(receipt.id, token);
      if (res.success && res.data?.pdfUrl) {
        window.open(res.data.pdfUrl, "_blank");
      }
    } finally {
      setDownloadLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-gray-500">Order not found.</p>
        <Link
          href="/my/orders"
          className="text-sm text-amber-700 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-LK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-xl divide-y">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.size ?? "no-size"}`}
            className="flex gap-4 p-4"
          >
            <div className="w-14 h-14 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </p>
              {item.size && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 mt-0.5 inline-block">
                  Size: {item.size}
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                LKR {item.unitPrice.toLocaleString()} × {item.quantity}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-900 shrink-0 pt-0.5">
              LKR {item.subtotal.toLocaleString()}
            </p>
          </div>
        ))}

        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-xl">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-amber-700">
            LKR {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Order Notes
          </p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Receipt */}
      {receipt && (
        <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {receipt.receiptNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                Issued{" "}
                {new Date(receipt.issuedAt).toLocaleDateString("en-LK", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloadLoading}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {downloadLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Download PDF"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
