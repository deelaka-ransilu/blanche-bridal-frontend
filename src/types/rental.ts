import type { ProductType } from "./product";

export type RentalStatus =
  | "PENDING_PAYMENT"
  | "BOOKED"
  | "ACTIVE"
  | "OVERDUE"
  | "RETURNED"
  | "CANCELLED";

export interface Rental {
  id: string;
  productId: string | null;
  productName: string | null;
  productImage: string | null;
  userId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  orderId: string | null;
  rentalStart: string; // LocalDate -> "YYYY-MM-DD"
  rentalEnd: string;
  returnDate: string | null;
  status: RentalStatus;
  depositAmount: number | null;
  balanceDue: number | null;
  notes: string | null;
  createdAt: string; // LocalDateTime -> ISO string
}

// Mirrors backend RentableProductResponse (rental/dto/res/RentableProductResponse.java)
// — used by WalkInSalePanel's select-gown step, distinct from Rental above
// (a booked/in-progress rental) which this is not.
export type RentableProduct = {
  id: string;
  name: string;
  type: ProductType;
  rentalPrice: number | null;
  rentalPricePerDay: number | null;
  categoryName: string | null;
  firstImageUrl: string | null;
};