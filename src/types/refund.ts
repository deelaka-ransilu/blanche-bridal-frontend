// Mirrors backend refund.dto.RefundResponse exactly.
export type Refund = {
  id: string; // UUID
  orderId: string; // UUID
  amount: number;
  reason: string | null;
  proofImageUrl: string | null;
  processedByAdminId: string; // UUID
  createdAt: string; // LocalDateTime, ISO string over the wire
};

// Mirrors backend refund.dto.BankDetailsResponse exactly.
export type BankDetails = {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branch: string | null;
  submittedAt: string;
};