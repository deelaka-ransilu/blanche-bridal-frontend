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