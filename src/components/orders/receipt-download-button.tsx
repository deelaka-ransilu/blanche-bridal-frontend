"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Loader2 } from "lucide-react";
import { downloadReceiptPdf } from "@/lib/api/receipts-client";

export function ReceiptDownloadButton({
  receiptId,
  receiptNumber,
}: {
  receiptId: string;
  receiptNumber: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    const token = session?.user?.backendToken as string | undefined;
    const result = await downloadReceiptPdf(receiptId, token);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Trigger a browser download from the in-memory blob, then revoke the
    // object URL immediately after -- no need to keep it around since the
    // download has already fired.
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setLoading(false);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-sm text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
        Receipt {receiptNumber}
      </span>
      <span className="text-xs text-muted-foreground">
        {error ?? (loading ? "Downloading…" : "Download PDF")}
      </span>
    </button>
  );
}