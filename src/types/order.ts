export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

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
  // NOTE: observed null in testing despite @CreationTimestamp/@UpdateTimestamp
  // on the entity — see CURRENT_STATE.md. Typed nullable to match reality,
  // not the (possibly buggy) backend intent.
  createdAt: string | null;
  updatedAt: string | null;
  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  fulfillmentMethod: string | null;
  deliveryAddress: string | null;
  customerPhone: string | null;
  orderMode: "WEBSITE" | "WALK_IN" | "WHATSAPP";
};