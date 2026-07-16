"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ReceiptDownloadResult =
  | { success: true; blob: Blob; filename: string }
  | { success: false; message: string };

/**
 * GET /api/receipts/{id}/download — streams the PDF bytes through the
 * backend proxy rather than exposing the Cloudinary URL directly.
 *
 * Deliberately kept in its own file, separate from receipts.ts. That file
 * imports authOptions (via getServerSession) for getMyReceipts(), which
 * pulls in next/headers -- a server-only module. Any client component
 * importing anything from a file that touches next/headers anywhere in it
 * breaks the build, even if the specific export doesn't use it. This file
 * has zero server-only imports so it's safe for client components.
 */
export async function downloadReceiptPdf(
  receiptId: string,
  token: string | undefined,
): Promise<ReceiptDownloadResult> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/api/receipts/${receiptId}/download`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      return { success: false, message: "Failed to download receipt. Please try again." };
    }

    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : `${receiptId}.pdf`;

    const blob = await res.blob();
    return { success: true, blob, filename };
  } catch {
    return { success: false, message: "Network error while downloading receipt." };
  }
}