"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, Loader2, FileText } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  getPaymentStatus,
  getMyReceipts,
  getReceiptPdfUrl,
} from "@/lib/api/orders";
import { ReceiptResponse } from "@/types";
import { Button } from "@/components/ui/button";

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2000;

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session?.user as any)?.token as string;

  const orderId = searchParams.get("order_id");
  const clearCart = useCartStore((s) => s.clearCart);

  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [polling, setPolling] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Poll payment status then fetch receipt
  const pollStatus = useCallback(async () => {
    if (!orderId || !token) {
      setPolling(false);
      return;
    }

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const statusRes = await getPaymentStatus(orderId, token);

        if (statusRes.success && statusRes.data?.status === "COMPLETED") {
          clearInterval(interval);

          // Find the matching receipt
          const receiptsRes = await getMyReceipts(token);
          if (receiptsRes.success && receiptsRes.data) {
            const match = receiptsRes.data.find((r) => r.orderId === orderId);
            if (match) setReceipt(match);
          }
          setPolling(false);
          return;
        }
      } catch {
        // silent — keep polling
      }

      if (attempts >= MAX_POLLS) {
        clearInterval(interval);
        setPolling(false);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderId, token, clearCart]);

  useEffect(() => {
    pollStatus();
  }, [pollStatus]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Thank you for your order. We&apos;re preparing it now.
          </p>
          {orderId && (
            <p className="text-xs text-gray-400 mt-1">
              Order ID: {orderId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {/* Receipt section */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {polling ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming payment...
            </div>
          ) : receipt ? (
            <>
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                <FileText className="w-4 h-4" />
                Receipt {receipt.receiptNumber}
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloadLoading}
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                {downloadLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Download Receipt
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Receipt will appear here once payment is confirmed.
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => router.push("/my/orders")}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            View My Orders
          </Button>
          <Link href="/catalog">
            <Button variant="ghost" className="w-full text-gray-600">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
