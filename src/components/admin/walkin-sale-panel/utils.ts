import type { Product } from "@/types/product";
import type { RentableProduct } from "@/types/rental";

export function getPrice(p: Product): number {
  return p.purchasePrice ?? p.rentalPrice ?? 0;
}

// Rentable-gown pricing: rentalPricePerDay (if set) × days, else flat
// rentalPrice — mirrors RentalServiceImpl's fee calculation exactly.
export function getRentalDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function getRentalFee(product: RentableProduct, days: number): number {
  if (product.rentalPricePerDay != null) return product.rentalPricePerDay * Math.max(days, 0);
  return product.rentalPrice ?? 0;
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

