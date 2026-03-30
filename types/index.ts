export type UserRole = "CUSTOMER" | "ADMIN";
export type ProductType = "DRESS" | "ACCESSORY";
export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type RentalStatus = "ACTIVE" | "OVERDUE" | "RETURNED";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InquiryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
}

export interface CustomerMeasurements {
  bust?: number;
  waist?: number;
  hips?: number;
  height?: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ProductType;
  categoryId: string;
  rentalPrice?: number;
  purchasePrice?: number;
  stock: number;
  sizes: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: string;
  user?: Pick<User, "firstName" | "lastName" | "profileImage">;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  product?: Pick<Product, "name" | "images">;
}

export interface Rental {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rentalStart: string;
  rentalEnd: string;
  returnDate?: string;
  status: RentalStatus;
  depositAmount: number;
  balanceDue: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  productId?: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  googleEventId?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  payhereOrderId: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  paidAt?: string;
}

export interface Inquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  imageUrls: string[];
  status: InquiryStatus;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  isRental: boolean;
  rentalStart?: string;
  rentalEnd?: string;
}

// ── API Response Shape ──────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
