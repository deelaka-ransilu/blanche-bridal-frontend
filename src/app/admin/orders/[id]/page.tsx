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
  Phone,
  Mail,
  Store,
  Truck,
  XCircle,
  ChevronRight,
  Check,
  CircleCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getOrderById,
  updateOrderStatus,
  getAllReceipts,
  getReceiptPdfUrl,
} from "@/lib/api/orders";
import { OrderResponse, OrderStatus, ReceiptResponse } from "@/types";
import { Button } from "@/components/ui/button";

// Forward pipeline — PENDING excluded (admin only sees post-payment orders)
const PIPELINE: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COMPLETED",
];

// Bug 2 fix — PROCESSING and READY added
const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED:  { label: "Confirmed",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
  PROCESSING: { label: "Processing", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  READY:      { label: "Ready",      className: "bg-green-50 text-green-700 border border-green-200" },
  COMPLETED:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-50 text-red-700 border border-red-200" },
};

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = PIPELINE.indexOf(current);
  if (idx === -1 || idx === PIPELINE.length - 1) return null;
  return PIPELINE[idx + 1];
}

function getPipelineLabel(status: OrderStatus): string {
  switch (status) {
    case "CONFIRMED":   return "Confirmed";
    case "PROCESSING":  return "Processing";
    case "READY":       return "Ready";
    case "COMPLETED":   return "Completed";
    default:            return status;
  }
}

function getInitials(first?: string, last?: string): string {
  return [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "??";
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([getOrderById(id, token), getAllReceipts(token)]).then(
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

  async function handleAdvance() {
    if (!order || !token) return;
    const next = getNextStatus(order.status);
    if (!next) return;
    setAdvancing(true);
    try {
      const res = await updateOrderStatus(order.id, next, token);
      if (res.success && res.data) {
        setOrder(res.data);
        toast.success(`Order moved to ${getPipelineLabel(next)}`);
      } else {
        toast.error(res.error?.message ?? "Failed to update status.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAdvancing(false);
    }
  }

  async function handleCancel() {
    if (!order || !token) return;
    setCancelling(true);
    try {
      const res = await updateOrderStatus(order.id, "CANCELLED", token);
      if (res.success && res.data) {
        setOrder(res.data);
        toast.success("Order cancelled.");
      } else {
        toast.error(res.error?.message ?? "Failed to cancel.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setCancelling(false);
    }
  }

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
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/admin/orders" className="text-sm text-amber-700 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const nextStatus = getNextStatus(order.status);
  const currentPipelineIdx = PIPELINE.indexOf(order.status);
  const badge = STATUS_BADGE[order.status];
  const initials = getInitials(order.customerFirstName, order.customerLastName);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-3 w-full min-w-0 overflow-x-hidden">

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

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
            <p className="text-xs text-red-500 mt-0.5">
              This order has been cancelled and cannot be advanced further.
            </p>
          </div>
        </div>
      )}

      {/* Status pipeline */}
      {!isCancelled && (
        <div className="bg-white border rounded-xl">
          {/* Section label */}
          <div className="px-4 pt-4 pb-0">
            <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Status pipeline
            </p>
          </div>

          {/* Steps */}
          <div className="flex items-start px-4 pb-4 w-full min-w-0">
            {PIPELINE.map((step, idx) => {
              const isCompleted = currentPipelineIdx > idx;
              const isCurrent = currentPipelineIdx === idx;
              const isLast = idx === PIPELINE.length - 1;

              return (
                <div key={step} className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center min-w-0 w-full">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-[1.5px] transition-all shrink-0 ${
                        isCompleted
                          ? "bg-amber-600 border-amber-600 text-white"
                          : isCurrent
                            ? "bg-white border-amber-500 text-amber-600"
                            : "bg-gray-50 border-gray-200 text-gray-300"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] mt-1.5 font-medium text-center leading-tight w-full wrap-break-word ${
                        isCompleted || isCurrent ? "text-amber-700" : "text-gray-300"
                      }`}
                    >
                      {getPipelineLabel(step)}
                    </span>
                  </div>

                  {!isLast && (
                    <div
                      className={`flex-1 h-px mt-3.5 mx-1 rounded transition-all shrink-0 min-w-2 ${
                        currentPipelineIdx > idx ? "bg-amber-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider + actions */}
          <div className="border-t" />
          <div className="flex items-center gap-3 flex-wrap px-4 py-3">
            {nextStatus ? (
              <>
                <Button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm h-8"
                >
                  {advancing ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  Mark as {getPipelineLabel(nextStatus)}
                </Button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-muted-foreground hover:text-red-600 disabled:opacity-40 transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </button>
              </>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ This order is complete.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customer + Fulfillment — responsive 2-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Customer */}
        <div className="bg-white border rounded-xl">
          <div className="px-4 py-3 border-b">
            <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              Customer
            </p>
          </div>
          <div className="p-4 space-y-2">
            {(order.customerFirstName || order.customerLastName) && (
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {[order.customerFirstName, order.customerLastName].filter(Boolean).join(" ")}
                  </p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
            )}
            {order.customerEmail && (
              <a
                href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors min-w-0"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{order.customerEmail}</span>
              </a>
            )}
            {order.customerPhone && (
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {order.customerPhone}
              </a>
            )}
            {!order.customerEmail && !order.customerPhone && (
              <p className="text-sm text-muted-foreground">No contact info saved.</p>
            )}
          </div>
        </div>

        {/* Fulfillment */}
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
                      No address provided.
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
                    Contact customer to arrange pickup or fitting appointment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              "View PDF"
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