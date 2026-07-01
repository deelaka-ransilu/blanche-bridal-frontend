export type ProductType = "DRESS" | "ACCESSORY";

export interface CategoryInfo {
  id: string;
  name: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  rentalPrice: number | null;
  purchasePrice: number | null;
  stock: number;
  isAvailable: boolean; // ⚠️ same Jackson boolean-naming caveat as AdminUser.active — verify against real JSON
  firstImageUrl: string | null;
  averageRating: number | null;
  category: CategoryInfo | null;
}

export interface ProductImageInfo {
  id: string;
  url: string;
  displayOrder: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ProductType;
  rentalPrice: number | null;
  purchasePrice: number | null;
  stock: number;
  isAvailable: boolean; // ⚠️ same caveat
  sizes: string[];
  images: ProductImageInfo[];
  averageRating: number | null;
  category: CategoryInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
}

export interface CreateProductInput {
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

export interface UpdateProductInput {
  name?: string;
  description?: string;
  type?: ProductType;
  categoryId?: string;
  rentalPrice?: number;
  purchasePrice?: number;
  stock?: number;
  sizes?: string[];
  imageUrls?: string[];
  isAvailable?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}