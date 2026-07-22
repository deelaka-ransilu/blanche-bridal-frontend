export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "PAYHERE" | "CASH" | "CARD" | "BANK_TRANSFER";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type ProductType = "DRESS" | "ACCESSORY";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type OrderItem = {
  productId: string | null;
  productName: string;
  productImage: string | null;
  productType: ProductType | null;
  quantity: number;
  unitPrice: number;
  size: string | null;
  subtotal: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string | null;
  updatedAt: string | null;
  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  fulfillmentMethod: string | null;
  deliveryAddress: string | null;
  customerPhone: string | null;
  orderMode: "WEBSITE" | "WALK_IN" | "WHATSAPP";
  paymentMethod: PaymentMethod;
  isRentalDeposit: boolean;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountReason: string | null;
  paymentStatus: PaymentStatus | null;
  refundAmount: number | null;
  refundedAt: string | null;
  bankDetailsSubmitted: boolean;
  refundProofImageUrl: string | null;
  proofImageUrl: string | null;
};

export type OrderItemRequest = {
  productId: string;
  quantity: number;
  size?: string;
};