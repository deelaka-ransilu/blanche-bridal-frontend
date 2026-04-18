export type UserRole = "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "CUSTOMER";
export type ProductType = "DRESS" | "ACCESSORY";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// ─── Phase 3 new types ───────────────────────────────────────────────────────
export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "PAYHERE" | "CASH" | "CARD";

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
  error?: ApiError;
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

// Merged — includes productId + productName for admin review moderation
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
  categoryId?: string;
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

// ─── Phase 3 interfaces ───────────────────────────────────────────────────────

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
