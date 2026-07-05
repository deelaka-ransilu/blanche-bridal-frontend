export type ProductType = "DRESS" | "ACCESSORY";

export type ProductCategory = {
  id: string;
  name: string;
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