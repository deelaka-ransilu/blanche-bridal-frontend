export type UserRole = "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "CUSTOMER";
export type ProductType = "DRESS" | "ACCESSORY";
export type ProductMode = "rental" | "purchase";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "PAYHERE" | "CASH" | "CARD";

export type RentalStatus = "ACTIVE" | "OVERDUE" | "RETURNED";
export type AppointmentType = "FITTING" | "RENTAL_PICKUP" | "PURCHASE";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type InquiryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface Measurements {
  id: string;
  publicId: string;
  customerId: string;
  heightWithShoes: number | null;
  hollowToHem: number | null;
  fullBust: number | null;
  underBust: number | null;
  naturalWaist: number | null;
  fullHip: number | null;
  shoulderWidth: number | null;
  torsoLength: number | null;
  thighCircumference: number | null;
  waistToKnee: number | null;
  waistToFloor: number | null;
  armhole: number | null;
  bicepCircumference: number | null;
  elbowCircumference: number | null;
  wristCircumference: number | null;
  sleeveLength: number | null;
  upperBust: number | null;
  bustApexDistance: number | null;
  shoulderToBustPoint: number | null;
  neckCircumference: number | null;
  trainLength: number | null;
  notes: string | null;
  measuredAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  fields?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { message: string };
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parentName?: string;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  displayOrder: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  rentalPrice?: number;
  purchasePrice?: number;
  stock: number;
  isAvailable: boolean;
  firstImageUrl?: string;
  averageRating?: number;
  category?: CategoryInfo;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  sizes: string[];
  images: ProductImage[];
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  reviewerName: string;
  createdAt: string;
  productId?: string;
  productName?: string;
}

export interface ProductFilters {
  type?: ProductType;
  mode?: ProductMode;
  categoryId?: string;
  collection?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  type: ProductType;
  categoryId?: string;
  rentalPrice?: number;
  purchasePrice?: number;
  stock: number;
  sizes?: string[];
  imageUrls?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  isAvailable?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  slug: string;
  type: ProductType;
  rentalPrice?: number;
  purchasePrice?: number;
  selectedSize?: string;
  quantity: number;
  // Stored at add-to-cart time so the cart and drawer can enforce
  // the stock limit without a network call.
  stock: number;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
}

export interface PaymentInitiateResponse {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  hash: string;
  itemsDescription: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface ReceiptResponse {
  id: string;
  receiptNumber: string;
  pdfUrl?: string;
  issuedAt: string;
  orderId: string;
  totalAmount: number;
}

export interface RentalResponse {
  id: string;
  productId: string | null;
  productName: string | null;
  productImage?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  orderId?: string;
  rentalStart: string;
  rentalEnd: string;
  returnDate?: string;
  status: RentalStatus;
  depositAmount?: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
}

export interface AppointmentResponse {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  productId?: string;
  productName?: string;
  appointmentDate: string;
  timeSlot: string;
  type: AppointmentType;
  status: AppointmentStatus;
  googleEventId?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  productId?: string;
  appointmentDate: string;
  timeSlot: string;
  type: AppointmentType;
  notes?: string;
}

export interface RescheduleAppointmentPayload {
  appointmentDate: string;
  timeSlot: string;
}

export interface CreateRentalPayload {
  productId: string;
  userId: string;
  rentalStart: string;
  rentalEnd: string;
  depositAmount?: number;
  notes?: string;
  orderId?: string;
}

export interface InquiryResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  imageUrl?: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  imageUrl?: string;
}