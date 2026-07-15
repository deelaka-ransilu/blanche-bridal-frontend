import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "./client";

// Field names assumed from the receipts table (order_id, payment_id,
// receipt_number, pdf_url) plus an issuedAt for the /my sort — confirm
// against the actual ReceiptResponse DTO if any of these don't match.
export type Receipt = {
  id: string;
  orderId: string;
  paymentId: string;
  receiptNumber: string;
  pdfUrl: string;
  issuedAt: string;
};

export type ReceiptListResult =
  | { success: true; data: Receipt[] }
  | { success: false; message: string; error?: string };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

/**
 * Customer -- GET /api/receipts/my (CUSTOMER role only, per @PreAuthorize)
 * No per-order lookup endpoint exists on the backend, so callers needing a
 * specific order's receipt should fetch this list and find by orderId.
 */
export async function getMyReceipts(): Promise<ReceiptListResult> {
  const token = await getToken();
  const result = await apiRequest<Receipt[]>(`/api/receipts/my`, { method: "GET" }, token);
  return result as unknown as ReceiptListResult;
}