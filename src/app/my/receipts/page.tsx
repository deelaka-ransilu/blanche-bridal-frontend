"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Loader2 } from "lucide-react";
import { getMyReceipts, getReceiptPdfUrl } from "@/lib/api/orders";
import { ReceiptResponse } from "@/types";
import { Button } from "@/components/ui/button";

export default function MyReceiptsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      return;
    }
    getMyReceipts(token).then((res) => {
      if (res.success && res.data) setReceipts(res.data);
      setLoading(false);
    });
  }, [token, status]);

  async function handleDownload(receipt: ReceiptResponse) {
    if (!token) return;
    setDownloadingId(receipt.id);
    try {
      const res = await getReceiptPdfUrl(receipt.id, token);
      if (res.success && res.data?.pdfUrl) {
        window.open(res.data.pdfUrl, "_blank");
      }
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Receipts</h1>

      {receipts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No receipts yet</p>
          <p className="text-sm text-muted-foreground">
            Receipts are generated automatically after a successful payment.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {receipt.receiptNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.issuedAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · LKR {receipt.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleDownload(receipt)}
                disabled={downloadingId === receipt.id}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 shrink-0"
              >
                {downloadingId === receipt.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
