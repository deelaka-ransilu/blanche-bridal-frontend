export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "PAYHERE" | "CASH" | "CARD";

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
};