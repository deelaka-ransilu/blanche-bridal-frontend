import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });
}

export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

/** Resolves a display name from an order's customer fields, falling back
 * to email then a generic label — shared by admin and employee order
 * detail pages. */
export function getCustomerName(order: {
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
}): string {
  return (
    [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") ||
    order.customerEmail ||
    "Unknown customer"
  );
}