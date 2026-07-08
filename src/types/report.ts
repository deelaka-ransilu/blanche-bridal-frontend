// Mirrors backend com.blanchebridal.backend.report.dto.* exactly.
// FIXED and PERCENTAGE discount amounts are kept as separate fields on
// DiscountReportItem and SummaryReport -- do NOT collapse them into one
// "total discounted" number on the frontend either. See
// BACKEND_HANDOVER_V2.md's Financial Reports section for the full rationale
// (Order has no stored pre-discount subtotal, so a PERCENTAGE discount's
// currency value can't be reconstructed from totalAmount alone).

export interface RevenueReportItem {
  month: string; // "2026-07"
  totalRevenue: number;
  orderCount: number;
}

export interface RefundReportItem {
  month: string; // "2026-07"
  totalRefunded: number;
  refundCount: number;
}

export interface DiscountReportItem {
  month: string; // "2026-07"
  fixedDiscountOrderCount: number;
  totalFixedDiscountAmount: number;
  percentageDiscountOrderCount: number;
  averagePercentageDiscount: number;
}

export interface SummaryReport {
  from: string; // ISO date "2026-01-01"
  to: string; // ISO date "2026-07-08"
  totalRevenue: number;
  completedOrderCount: number;
  totalRefunded: number;
  refundCount: number;
  discountedOrderCount: number;
  totalFixedDiscountAmount: number;
  percentageDiscountOrderCount: number;
}