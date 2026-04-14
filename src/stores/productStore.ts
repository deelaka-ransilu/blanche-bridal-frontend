import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
// Structured so Phase 3 cart store can extend this naturally.
// Cart will read selectedSize + selectedProductId when "Add to cart" is clicked.

interface ProductStoreState {
  // Currently viewed product detail page state
  selectedProductId: string | null;
  selectedSize: string | null;

  // Actions
  setSelectedProduct: (productId: string) => void;
  setSelectedSize: (size: string | null) => void;
  clearSelection: () => void;
}

export const useProductStore = create<ProductStoreState>((set) => ({
  selectedProductId: null,
  selectedSize: null,

  setSelectedProduct: (productId) =>
    set({ selectedProductId: productId, selectedSize: null }),

  setSelectedSize: (size) => set({ selectedSize: size }),

  clearSelection: () => set({ selectedProductId: null, selectedSize: null }),
}));
