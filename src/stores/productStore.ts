import { create } from "zustand";

interface ProductStoreState {
  selectedProductId: string | null;
  selectedSize: string | null;

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
