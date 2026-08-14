import { PaymentMethod } from "./order";
import type { ProductType } from "./product";

export type RentalStatus =
  | "PENDING_PAYMENT"
  | "BOOKED"
  | "ACTIVE"
  | "OVERDUE"
  | "RETURNED"
  | "CANCELLED";

export type RentalBookingPath = "ADVANCE" | "SAME_DAY";

export interface Rental {
  id: string;
  productId: string | null;
  productName: string | null;
  productImage: string | null;
  userId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  orderId: string | null;
  paymentMethod: PaymentMethod | null;
  handoverPaymentMethod: PaymentMethod | null;
  bookingPath: RentalBookingPath;
  rentalStart: string; // LocalDate -> "YYYY-MM-DD"
  rentalEnd: string;
  returnDate: string | null;
  status: RentalStatus;
  dressValue: number | null;
  notes: string | null;
  createdAt: string; // LocalDateTime -> ISO string
  fittingDate: string | null;
  fittingTimeSlot: string | null;
  fittingAppointmentId: string | null;
  rentalFee: number | null;
  damageCost: number | null;
  lateFeeAmount: number | null;
  refundAmount: number | null;
  amountOwedByCustomer: number | null;
  handoverConfirmedAt: string | null;
  handoverOrderId: string | null;
}

// Mirrors backend RentableProductResponse (rental/dto/res/RentableProductResponse.java)
// — used by WalkInSalePanel's select-gown step, distinct from Rental above
// (a booked/in-progress rental) which this is not.
export type RentableProduct = {
  id: string;
  name: string;
  type: ProductType;
  rentalPrice: number | null;
  dressValue: number | null;
  categoryName: string | null;
  firstImageUrl: string | null;
};