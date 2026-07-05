export type RentalStatus = "ACTIVE" | "OVERDUE" | "RETURNED";

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