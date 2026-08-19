import { apiRequest } from "@/lib/api/client";
import { getToken } from "@/lib/api/server";

// Field names assumed from the receipts table (order_id, payment_id,
// receipt_number, pdf_url) plus an issuedAt for the /my sort — confirm
// against the actual ReceiptResponse DTO if any of these don't match.
//
// orderId/rentalId are mutually exclusive in practice: PAYMENT receipts
// (generated from PaymentServiceImpl on order confirmation) always have
// orderId set and rentalId null; REFUND receipts (generated from
// RentalServiceImpl.markReturned) always have rentalId set and orderId
// null. type tells callers which shape to expect rather than having to
// infer it from which id is present.
export type Receipt = {
  id: string;
  orderId: string | null;
  rentalId: string | null;
  type: "PAYMENT" | "REFUND";
  receiptNumber: string;
  pdfUrl: string;
  issuedAt: string;
};

export type ReceiptListResult =
  | { success: true; data: Receipt[] }
  | { success: false; message: string; error?: string };

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

export type ReceiptResult =
  | { success: true; data: Receipt }
  | { success: false; message: string; error?: string };

/**
 * GET /api/receipts/by-order/{orderId} — dedicated lookup, replaces the
 * old approach of fetching the full receipt list and filtering client-side.
 */
export async function getReceiptByOrderId(orderId: string): Promise<ReceiptResult> {
  const token = await getToken();
  const result = await apiRequest<Receipt>(`/api/receipts/by-order/${orderId}`, { method: "GET" }, token);
  return result as unknown as ReceiptResult;
}

/**
 * GET /api/receipts/by-rental/{rentalId} — refund/settlement receipt for a
 * returned rental. Only exists once RentalServiceImpl.markReturned has run
 * (it generates the receipt synchronously in the same transaction as the
 * return), so callers should only call this once rental.status === "RETURNED"
 * — calling it earlier just returns a 404-shaped failure.
 */
export async function getReceiptByRentalId(rentalId: string): Promise<ReceiptResult> {
  const token = await getToken();
  const result = await apiRequest<Receipt>(`/api/receipts/by-rental/${rentalId}`, { method: "GET" }, token);
  return result as unknown as ReceiptResult;
}