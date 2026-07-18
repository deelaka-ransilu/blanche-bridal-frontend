export type ProductType = "DRESS" | "ACCESSORY";

// Frontend-defined size scale — backend stores these as plain strings in a
// JSON array column (Product.sizes: TEXT), no backend enum exists. This is
// purely a frontend constraint to standardize input; if the value set needs
// to change later, only this file needs updating, no migration required.
export const PRODUCT_SIZES = [
  "CHILD_XS",
  "CHILD_S",
  "CHILD_M",
  "CHILD_L",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const PRODUCT_SIZE_LABELS: Record<ProductSize, string> = {
  CHILD_XS: "Child XS",
  CHILD_S: "Child S",
  CHILD_M: "Child M",
  CHILD_L: "Child L",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
};

export type ProductCategory = {
  id: string;
  name: string;
  type: ProductType;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  rentalPrice: number | null;
  purchasePrice: number | null;
  stock: number;
  isAvailable: boolean;
  firstImageUrl: string | null;
  averageRating: number | null;
  category: ProductCategory | null;
};

export type ProductImage = {
  id: string;
  url: string;
  displayOrder: number;
};

// Mirrors backend ProductDetailResponse exactly (product/dto/res/ProductDetailResponse.java)
export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ProductType;
  rentalPrice: number | null;
  rentalPricePerDay: number | null;
  purchasePrice: number | null;
  stock: number;
  isAvailable: boolean;
  sizes: string[];
  images: ProductImage[];
  averageRating: number | null;
  category: ProductCategory | null;
  createdAt: string | null;
  updatedAt: string | null;
};