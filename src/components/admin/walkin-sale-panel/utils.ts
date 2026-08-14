import type { Product } from "@/types/product";
import type { RentableProduct } from "@/types/rental";
import type { RentalBookingPath } from "@/types/rental";

export function getPrice(p: Product): number {
  return p.purchasePrice ?? p.rentalPrice ?? 0;
}

// rentalPrice — mirrors RentalServiceImpl's fee calculation exactly. This
// is the SHOP'S EARNED fee, shown for context only — it is NOT the amount
// due at booking (see getAmountDue below).
export function getRentalDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function getRentalFee(product: RentableProduct): number {
  return product.rentalPrice ?? 0;
}

// Amount actually due at booking — dressValue-based, mirrors
// RentalServiceImpl.createRentalBooking's amountDueNow calculation exactly:
// 50% of dressValue for ADVANCE, 100% for SAME_DAY.
export function getAmountDue(product: RentableProduct, bookingPath: RentalBookingPath): number {
  const dressValue = product.dressValue ?? 0;
  return bookingPath === "SAME_DAY" ? dressValue : dressValue * 0.5;
}

// Local YYYY-MM-DD for date-input `min` guards — matches what <input
// type="date"> reads/writes, avoiding UTC-shift-by-one issues from
// toISOString().
export function todayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysLocal(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}