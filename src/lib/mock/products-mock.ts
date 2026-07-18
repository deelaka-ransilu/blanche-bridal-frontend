export type CatalogProduct = {
  id: string;
  name: string;
  type: "DRESS" | "ACCESSORY";
  category: { id: string; name: string };
  stock: number;
  purchasePrice: number;
  sizes: string[];
  isAvailable: boolean;
  firstImageUrl: string | null;
};

export type RentalStatus = "AVAILABLE" | "RENTED" | "OVERDUE";

export type RentalProduct = {
  id: string;
  name: string;
  category: { id: string; name: string };
  rentalPrice: number | null;
  rentalPricePerDay: number | null;
  sizes: string[];
  rentalStatus: RentalStatus; // mock only — derived from bookings once wired
  firstImageUrl: string | null;
};

export type GalleryImage = {
  id: string;
  url: string | null;
  caption: string;
};

export type MockCategory = {
  id: string;
  name: string;
  slug: string;
  type: "DRESS" | "ACCESSORY";
};

// Mirrors the real `categories` table today, plus a `type` field that
// doesn't exist on the backend Category entity yet — this is exactly the
// column planned for a future migration (DRESS/ACCESSORY, mirroring
// ProductType). Once that lands, swap this mock for the real categories
// prop and drop this file's `type` guesses.
export const mockCategories: MockCategory[] = [
  { id: "cat-1", name: "Bridal Gowns", slug: "bridal-gowns", type: "DRESS" as const },
  { id: "cat-2", name: "Evening Gowns", slug: "evening-gowns", type: "DRESS" as const },
  { id: "cat-3", name: "Cocktail Dresses", slug: "cocktail-dresses", type: "DRESS" as const },
  { id: "cat-4", name: "Party Dresses", slug: "party-dresses", type: "DRESS" as const },
  { id: "cat-5", name: "Veils", slug: "veils", type: "ACCESSORY" as const },
  { id: "cat-6", name: "Tiaras & Headpieces", slug: "tiaras-headpieces", type: "ACCESSORY" as const },
  { id: "cat-7", name: "Jewellery", slug: "jewellery", type: "ACCESSORY" as const },
  { id: "cat-8", name: "Shoes", slug: "shoes", type: "ACCESSORY" as const },
];

export const mockCatalogProducts: CatalogProduct[] = [
  {
    id: "mock-1",
    name: "Aurora Lace Mermaid Gown",
    type: "DRESS",
    category: { id: "cat-1", name: "Bridal Gowns" },
    stock: 98,
    purchasePrice: 45000,
    sizes: ["S", "M", "L"],
    isAvailable: true,
    firstImageUrl: null,
  },
  {
    id: "mock-2",
    name: "Kandyan Bridal Necklace Set",
    type: "ACCESSORY",
    category: { id: "cat-7", name: "Jewellery" },
    stock: 1,
    purchasePrice: 12000,
    sizes: [],
    isAvailable: true,
    firstImageUrl: null,
  },
];

export const mockRentalProducts: RentalProduct[] = [
  {
    id: "mock-rent-1",
    name: "Midnight Velvet Evening Gown",
    category: { id: "cat-2", name: "Evening Gowns" },
    rentalPrice: 6000,
    rentalPricePerDay: null,
    sizes: ["S", "M", "L", "XL"],
    rentalStatus: "AVAILABLE",
    firstImageUrl: null,
  },
  {
    id: "mock-rent-2",
    name: "Ivory Chiffon Bridal Gown",
    category: { id: "cat-1", name: "Bridal Gowns" },
    rentalPrice: null,
    rentalPricePerDay: 1500,
    sizes: ["M", "L"],
    rentalStatus: "RENTED",
    firstImageUrl: null,
  },
  {
    id: "mock-rent-3",
    name: "Scarlet Cocktail Dress",
    category: { id: "cat-3", name: "Cocktail Dresses" },
    rentalPrice: 3500,
    rentalPricePerDay: null,
    sizes: ["S", "M"],
    rentalStatus: "OVERDUE",
    firstImageUrl: null,
  },
];

export const mockGalleryImages: GalleryImage[] = [
  { id: "img-1", url: null, caption: "Spring collection shoot" },
];