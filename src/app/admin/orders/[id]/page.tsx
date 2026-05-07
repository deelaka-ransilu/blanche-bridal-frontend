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
  MapPin,
  Store,
  Truck,
  XCircle,
  ChevronRight,
  Check,
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
import { apiRequest } from "@/lib/api/client";
import type { User } from "@/types";

// The forward pipeline — PENDING is intentionally excluded.
// By the time admin sees an order it is already CONFIRMED (payment received).
const PIPELINE: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COMPLETED",
];

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
      <div className="p-8 space-y-4">
        <div className="h-5 w-28 rounded bg-gray-100 animate-pulse" />
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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      {/* Header */}
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

      {/* ── Cancelled banner ─────────────────────────────────────── */}
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

      {/* ── Status pipeline ──────────────────────────────────────── */}
      {!isCancelled && (
        <div className="bg-white border rounded-xl p-5 space-y-5">
          {/* Pipeline steps */}
          <div className="flex items-center">
            {PIPELINE.map((step, idx) => {
              const isCompleted = currentPipelineIdx > idx;
              const isCurrent = currentPipelineIdx === idx;
              const isFuture = currentPipelineIdx < idx;
              const isLast = idx === PIPELINE.length - 1;

              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  {/* Step circle */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        isCompleted
                          ? "bg-amber-600 border-amber-600 text-white"
                          : isCurrent
                            ? "bg-white border-amber-500 text-amber-600"
                            : "bg-gray-50 border-gray-200 text-gray-300"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium text-center leading-tight ${
                        isCompleted
                          ? "text-amber-700"
                          : isCurrent
                            ? "text-amber-600"
                            : "text-gray-300"
                      }`}
                    >
                      {getPipelineLabel(step)}
                    </span>
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-5 rounded transition-all ${
                        currentPipelineIdx > idx
                          ? "bg-amber-400"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Advance button */}
          {nextStatus ? (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAdvance}
                disabled={advancing}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {advancing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1" />
                )}
                Mark as {getPipelineLabel(nextStatus)}
              </Button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-40 transition-colors"
              >
                {cancelling ? "Cancelling..." : "Cancel order"}
              </button>
            </div>
          ) : (
            // Order is COMPLETED
            <p className="text-xs text-emerald-600 font-medium">
              ✓ This order is complete.
            </p>
          )}
        </div>
      )}

      {/* ── Customer info ─────────────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Customer
        </p>
        {(order.customerFirstName || order.customerLastName) && (
          <p className="text-sm font-medium text-gray-900">
            {[order.customerFirstName, order.customerLastName]
              .filter(Boolean)
              .join(" ")}
          </p>
        )}
        {order.customerEmail && (
          <a
            href={`mailto:${order.customerEmail}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {order.customerEmail}
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

      {/* ── Fulfillment ───────────────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Fulfillment
        </p>
        {order.fulfillmentMethod === "DELIVERY" ? (
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery</p>
              {order.deliveryAddress ? (
                <p className="text-sm text-gray-600 mt-0.5">
                  {order.deliveryAddress}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No address provided.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">In-store Pickup</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contact customer to arrange pickup or fitting appointment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Items ─────────────────────────────────────────────────── */}
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
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                {item.size && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    Size: {item.size}
                  </span>
                )}
                {item.mode && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      item.mode === "rental"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
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

        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-xl">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-amber-700">
            LKR {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {order.notes && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Order Notes
          </p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* ── Receipt ───────────────────────────────────────────────── */}
      {receipt ? (
        <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                {" · "}LKR {receipt.totalAmount.toLocaleString()}
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