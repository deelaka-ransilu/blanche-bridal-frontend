import { apiRequest } from "./client";
import {
  OrderResponse,
  OrderStatus,
  PaymentInitiateResponse,
  ReceiptResponse,
} from "@/types";

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = (
  items: { productId: string; quantity: number; size?: string }[],
  notes: string | undefined,
  token: string,
) =>
  apiRequest<OrderResponse>(
    "/api/orders",
    {
      method: "POST",
      body: JSON.stringify({ items, notes }),
    },
    token,
  );

export const getMyOrders = (token: string, page = 0) =>
  apiRequest<OrderResponse[]>(`/api/orders/my?page=${page}`, {}, token);

export const getOrderById = (id: string, token: string) =>
  apiRequest<OrderResponse>(`/api/orders/${id}`, {}, token);

export const getAllOrders = (token: string, status?: OrderStatus, page = 0) => {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiRequest<OrderResponse[]>(`/api/orders?${params}`, {}, token);
};

export const updateOrderStatus = (
  id: string,
  status: OrderStatus,
  token: string,
) =>
  apiRequest<OrderResponse>(
    `/api/orders/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    token,
  );

// ─── Payments ────────────────────────────────────────────────────────────────

export const initiatePayment = (orderId: string, token: string) =>
  apiRequest<PaymentInitiateResponse>(
    "/api/payments/initiate",
    {
      method: "POST",
      body: JSON.stringify({ orderId }),
    },
    token,
  );

export const getPaymentStatus = (orderId: string, token: string) =>
  apiRequest<{ status: string }>(`/api/payments/status/${orderId}`, {}, token);

// ─── Receipts ────────────────────────────────────────────────────────────────

export const getMyReceipts = (token: string) =>
  apiRequest<ReceiptResponse[]>("/api/receipts/my", {}, token);

export const getAllReceipts = (token: string, page = 0) =>
  apiRequest<ReceiptResponse[]>(`/api/receipts?page=${page}`, {}, token);

export const getReceiptPdfUrl = (receiptId: string, token: string) =>
  apiRequest<{ pdfUrl: string }>(`/api/receipts/${receiptId}/pdf`, {}, token);
