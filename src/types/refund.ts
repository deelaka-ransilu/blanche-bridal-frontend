// Mirrors backend refund.dto.RefundResponse exactly.
export type Refund = {
  id: string; // UUID
  orderId: string; // UUID
  amount: number;
  reason: string | null;
  processedByAdminId: string; // UUID
  createdAt: string; // LocalDateTime, ISO string over the wire
};