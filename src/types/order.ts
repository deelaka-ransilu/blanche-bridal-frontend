export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "PAYHERE" | "CASH" | "CARD";

// Mirrors backend order.entity.DiscountType exactly.
export type DiscountType = "PERCENTAGE" | "FIXED";

export type OrderItem = {
  productId: string | null;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  size: string | null;
  subtotal: number;
};

export type Order = {
  id: string; // UUID
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
  // Discount fields (Step 9c, FR-OM-11) — staff-only, null = no discount applied.
  discountType: DiscountType | null;
  discountValue: number | null;
  discountReason: string | null;
};

// Mirrors backend order.dto.req.OrderItemRequest — used to build the
// create-order payload client-side before JSON.stringify.
export type OrderItemRequest = {
  productId: string;
  quantity: number;
  size?: string;
};