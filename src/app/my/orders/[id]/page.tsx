"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  FileText,
  Loader2,
  CircleCheck,
  Truck,
  Store,
} from "lucide-react";
import {
  getOrderById,
  getMyReceipts,
  getReceiptPdfUrl,
} from "@/lib/api/orders";
import { OrderResponse, OrderStatus, ReceiptResponse } from "@/types";
import { Button } from "@/components/ui/button";

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED:  { label: "Confirmed",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
  PROCESSING: { label: "Processing", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  READY:      { label: "Ready for pickup", className: "bg-green-50 text-green-700 border border-green-200" },
  COMPLETED:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-50 text-red-700 border border-red-200" },
};

// Human-readable status descriptions shown to the customer
const STATUS_DESCRIPTION: Partial<Record<OrderStatus, string>> = {
  PENDING:    "Waiting for payment confirmation.",
  CONFIRMED:  "Your payment was received. We're preparing your order.",
  PROCESSING: "Your order is being prepared by our team.",
  READY:      "Your order is ready! Please come in or expect delivery soon.",
  COMPLETED:  "This order has been fulfilled. Thank you!",
  CANCELLED:  "This order was cancelled.",
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
        // Fetch the PDF as a blob
        const pdfResponse = await fetch(res.data.pdfUrl);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF");
        }
        
        const blob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create an anchor element and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `receipt-${receipt.receiptNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
        <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/my/orders" className="text-sm text-amber-700 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[order.status];
  const description = STATUS_DESCRIPTION[order.status];
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-3">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            {new Date(order.createdAt).toLocaleDateString("en-LK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 self-start mt-1 ${badge.className}`}
        >
          <CircleCheck className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      {/* Status description card */}
      {description && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            isCancelled
              ? "bg-red-50 border-red-200 text-red-700"
              : order.status === "READY"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          {description}
        </div>
      )}

      {/* Fulfillment */}
      {order.fulfillmentMethod && (
        <div className="bg-white border rounded-xl">
          <div className="px-4 py-3 border-b">
            <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              Fulfillment
            </p>
          </div>
          <div className="p-4">
            {order.fulfillmentMethod === "DELIVERY" ? (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery</p>
                  {order.deliveryAddress ? (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {order.deliveryAddress}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      No address on file.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">In-store Pickup</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We'll contact you to arrange a pickup or fitting appointment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border rounded-xl divide-y overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            Items
          </p>
          <p className="text-xs text-muted-foreground">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.size ?? "no-size"}`}
            className="flex gap-3 sm:gap-4 p-4"
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
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
                  <ShoppingBag className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {item.size && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    Size {item.size}
                  </span>
                )}
                {item.mode && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.mode === "rental"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}
                  >
                    {item.mode === "rental" ? "Rental" : "Purchase"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                LKR {item.unitPrice.toLocaleString()} × {item.quantity}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-900 shrink-0 pt-0.5">
              LKR {item.subtotal.toLocaleString()}
            </p>
          </div>
        ))}

        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order total
          </span>
          <span className="text-lg font-semibold text-amber-700">
            LKR {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Order notes
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{order.notes}</p>
        </div>
      )}

      {/* Receipt */}
      {receipt ? (
        <div className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {receipt.receiptNumber}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Issued{" "}
                {new Date(receipt.issuedAt).toLocaleDateString("en-LK", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}LKR {receipt.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloadLoading}
            variant="outline"
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-50 shrink-0"
          >
            {downloadLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Download PDF"
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No receipt yet — generated automatically after payment is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}